import { FastifyInstance } from "fastify";
import { WebhookController } from "../controllers/webhook.controller.js";

const webhookController = new WebhookController();

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/webhooks/mercadopago", webhookController.handle);
}
