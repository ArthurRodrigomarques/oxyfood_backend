import { FastifyRequest, FastifyReply } from "fastify";
import { HandleWebhookUseCase } from "@/use-cases/order/handle-webhook.use-case.js";
import { HandleAsaasWebhookUseCase } from "@/use-cases/restaurant/handle-asaas-webhook.use-case.js";
import { prisma } from "@/lib/prisma.js";
import { evolutionApi } from "@/lib/evolution-api.js";
import { whatsappQueue } from "@/lib/queue.js";

export class WebhookController {
  async handleMercadoPago(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const body = request.body as any;
      const restaurantId = query.restaurantId;

      if (!restaurantId) {
        return reply.status(400).send();
      }

      let paymentId =
        query["data.id"] || query.id || body?.data?.id || body?.id;
      let topic = query.type || query.topic || body?.type || body?.action;

      if (body?.action === "payment.created") topic = "payment";

      if (!paymentId) {
        return reply.status(200).send();
      }

      const handleWebhook = new HandleWebhookUseCase();
      await handleWebhook.execute({
        id: String(paymentId),
        topic: topic || "payment",
        restaurantId,
      });

      return reply.status(200).send();
    } catch (error) {
      return reply.status(500).send();
    }
  }

  async handleAsaas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;

      const asaasToken = request.headers["asaas-access-token"];
      if (
        process.env.ASAAS_WEBHOOK_TOKEN &&
        asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN
      ) {
        return reply.status(401).send();
      }

      if (!body.event || !body.payment) {
        return reply.status(200).send({ status: "ignored_invalid_payload" });
      }

      const handleAsaas = new HandleAsaasWebhookUseCase();
      await handleAsaas.execute(body);

      return reply.status(200).send({ received: true });
    } catch (error) {
      return reply.status(500).send({ received: false });
    }
  }

  async handleEvolution(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;

    if (body.event !== "MESSAGES_UPSERT") {
      return reply.status(200).send();
    }

    const messageData = body.data;

    if (messageData.key.fromMe) {
      return reply.status(200).send();
    }
    await whatsappQueue.add("process-message", {
      instanceName: body.instance,
      messageData: messageData,
    });

    return reply.status(200).send();
  }
}
