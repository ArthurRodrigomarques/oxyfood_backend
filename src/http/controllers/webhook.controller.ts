import { FastifyRequest, FastifyReply } from "fastify";
import { HandleWebhookUseCase } from "@/use-cases/order/handle-webhook.use-case.js";

export class WebhookController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const body = request.body as any;
      const restaurantId = query.restaurantId;

      if (!restaurantId) {
        return reply.status(400).send({ message: "RestaurantId required" });
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
      console.error("Webhook Error:", error);
      return reply.status(200).send();
    }
  }
}
