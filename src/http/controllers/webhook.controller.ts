import { FastifyRequest, FastifyReply } from "fastify";
import { HandleWebhookUseCase } from "@/use-cases/order/handle-webhook.use-case.js";
import { HandleAsaasWebhookUseCase } from "@/use-cases/restaurant/handle-asaas-webhook.use-case.js";

export class WebhookController {
  async handleMercadoPago(request: FastifyRequest, reply: FastifyReply) {
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
      return reply.status(200).send();
    }
  }

  async handleAsaas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      console.log("\n🔔 [WEBHOOK ASAAS RECEBIDO]");
      console.log("Evento:", body.event);
      console.log("Customer ID:", body.payment?.customer);
      console.log(
        "External Reference (ID Restaurante):",
        body.payment?.externalReference
      );
      console.log("Status Pagamento:", body.payment?.status);

      if (!body.event || !body.payment) {
        console.log("❌ Payload ignorado: Faltando event ou payment");
        return reply.status(200).send({ status: "ignored" });
      }

      const handleAsaas = new HandleAsaasWebhookUseCase();
      await handleAsaas.execute(body);

      console.log("✅ Webhook processado sem erros.");
      return reply.status(200).send({ received: true });
    } catch (error) {
      console.error("❌ ERRO NO CONTROLLER DO ASAAS:", error);
      return reply.status(200).send();
    }
  }
}
