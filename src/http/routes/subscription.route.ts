import { FastifyInstance } from "fastify";
import { createSubscription } from "@/http/controllers/subscription.controller.js";

import { authMiddleware } from "@/http/middlewares/auth.middleware.js";

export async function subscriptionRoutes(app: FastifyInstance) {
  app.post(
    "/subscriptions",
    { onRequest: [authMiddleware] },
    createSubscription
  );
}
