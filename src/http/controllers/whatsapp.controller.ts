import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { evolutionApi } from "@/lib/evolution-api.js";

export class WhatsappController {
  async connect(request: FastifyRequest, reply: FastifyReply) {
    const connectBodySchema = z.object({
      restaurantId: z.string().uuid(),
    });

    const { restaurantId } = connectBodySchema.parse(request.body);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return reply.status(404).send({ message: "Restaurante não encontrado." });
    }

    const instanceName = `rest_${restaurant.id.replace(/-/g, "")}`;
    let finalQrCode: string | null = null;

    try {
      console.log(`🔌 Iniciando conexão FRESH para: ${instanceName}`);

      // 1. ESTRATÉGIA AGRESSIVA: Tenta deletar antes de criar
      // Isso garante que não vamos tentar conectar em uma instância travada
      console.log("🧹 Limpando sessões antigas...");
      await evolutionApi.deleteInstance(instanceName);

      // Espera 1s para garantir que o Docker limpou
      await new Promise((r) => setTimeout(r, 1000));

      // 2. Cria uma instância novinha em folha
      console.log("✨ Criando nova instância...");
      const createResult = await evolutionApi.createInstance(instanceName);
      console.log("📝 Create Result:", JSON.stringify(createResult, null, 2));

      // 3. LOOP DE ESPERA (Polling)
      console.log("⏳ Aguardando QR Code...");

      for (let i = 1; i <= 10; i++) {
        // Espera 2.5 segundos (aumentei um pouco o tempo)
        await new Promise((r) => setTimeout(r, 2500));

        console.log(`🔄 Tentativa ${i}/10...`);
        const data = await evolutionApi.connectInstance(instanceName);

        // Verifica se veio QR Code
        const base64 = data?.base64 || data?.qrcode?.base64 || data?.qrcode;

        if (base64 && typeof base64 === "string" && base64.length > 100) {
          console.log("✅ QR Code Capturado com sucesso!");
          finalQrCode = base64;
          break;
        } else {
          // Debug leve para não poluir
          const status = data?.instance?.status || "desconhecido";
          console.log(
            `   (Status atual: ${status} - QR Count: ${data?.qrcode?.count || 0})`,
          );
        }
      }

      // 4. Salva no banco
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { whatsappInstanceName: instanceName, whatsappStatus: "QRCODE" },
      });

      // 5. Retorno
      if (finalQrCode) {
        return reply.status(200).send({
          qrcode: finalQrCode,
          instanceName,
        });
      } else {
        console.log("❌ Timeout. Deletando para tentar novamente depois.");
        await evolutionApi.deleteInstance(instanceName);

        return reply.status(200).send({
          message:
            "O WhatsApp demorou para responder. Tente novamente em 5 segundos.",
          connected: false,
          shouldRetry: true,
        });
      }
    } catch (error) {
      console.error(error);
      return reply
        .status(500)
        .send({ message: "Erro interno ao conectar WhatsApp" });
    }
  }

  async disconnect(request: FastifyRequest, reply: FastifyReply) {
    const disconnectBodySchema = z.object({ restaurantId: z.string().uuid() });
    const { restaurantId } = disconnectBodySchema.parse(request.body);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (restaurant?.whatsappInstanceName) {
      await evolutionApi.deleteInstance(restaurant.whatsappInstanceName);
    }
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { whatsappStatus: "DISCONNECTED", whatsappInstanceName: null },
    });
    return reply.status(200).send({ message: "Desconectado." });
  }
}
