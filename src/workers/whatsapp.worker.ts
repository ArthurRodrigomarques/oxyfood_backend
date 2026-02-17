import { Worker } from "bullmq";
import { evolutionApi } from "@/lib/evolution-api.js";
import { prisma } from "@/lib/prisma.js";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASS || undefined,
};

// O Worker processa os Jobs da fila 'whatsapp-messages'
export const whatsappWorker = new Worker(
  "whatsapp-messages",
  async (job) => {
    const { instanceName, messageData } = job.data;

    // --- AQUI VEM A LÓGICA DO BOT (que estava no Controller) ---

    const userPhone = messageData.key.remoteJid;
    const userName = messageData.pushName || "Cliente";

    // Pega o texto da mensagem (tenta vários campos possíveis)
    const text =
      messageData.message?.conversation ||
      messageData.message?.extendedTextMessage?.text ||
      "";

    console.log(`🤖 Worker processando mensagem de ${userName}: ${text}`);

    try {
      // 1. Busca o restaurante dono da instância
      const restaurant = await prisma.restaurant.findUnique({
        where: { whatsappInstanceName: instanceName },
      });

      if (!restaurant) {
        console.log(`❌ Instância ${instanceName} sem restaurante vinculado.`);
        return;
      }

      // 2. Lógica de Resposta
      if (
        text.toLowerCase().includes("cardápio") ||
        text.toLowerCase().includes("menu")
      ) {
        await evolutionApi.sendText(
          instanceName,
          userPhone,
          `Olá ${userName}! 👋\n\nBem-vindo ao *${restaurant.name}*.\n\nAcesse nosso cardápio aqui:\nhttps://oxyfood.com.br/cardapio/${restaurant.slug}`,
        );
      } else {
        await evolutionApi.sendText(
          instanceName,
          userPhone,
          `Olá! Digite *cardápio* para ver nossas opções.`,
        );
      }

      // Simula um delay humano
      // await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro no Worker:", error);
      throw error; // Se jogar erro, o BullMQ tenta de novo (attempts)
    }
  },
  {
    connection,
    concurrency: 5, // Processa até 5 mensagens ao mesmo tempo (ajuste conforme a força da sua VPS)
    limiter: {
      max: 10, // Máximo de 10 mensagens
      duration: 1000, // Por segundo (evita banimento do WhatsApp)
    },
  },
);

console.log("🚀 WhatsApp Worker iniciado!");
