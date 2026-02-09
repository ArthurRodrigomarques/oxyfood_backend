import { FastifyInstance } from "fastify";
import {
  createSubscription,
  cancelSubscription,
} from "@/http/controllers/subscription.controller.js";
import { SubscriptionCronController } from "@/http/controllers/subscription-cron.controller.js";
import { authMiddleware } from "@/http/middlewares/auth.middleware.js";

const cronController = new SubscriptionCronController();

export async function subscriptionRoutes(app: FastifyInstance) {
  app.post(
    "/subscriptions",
    { onRequest: [authMiddleware] },
    createSubscription,
  );

  app.get("/subscriptions/check-expired", cronController.handle);

  app.patch(
    "/subscription/cancel",
    { onRequest: [authMiddleware] },
    cancelSubscription,
  );
}
