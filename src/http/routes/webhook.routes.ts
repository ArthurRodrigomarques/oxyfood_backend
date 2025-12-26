import { FastifyInstance } from "fastify";
import { WebhookController } from "../controllers/webhook.controller.js";

const webhookController = new WebhookController();

export async function webhookRoutes(app: FastifyInstance) {
  app.post(
    "/webhooks/mercadopago",
    webhookController.handleMercadoPago.bind(webhookController)
  );
  app.post(
    "/webhooks/asaas",
    webhookController.handleAsaas.bind(webhookController)
  );
}
