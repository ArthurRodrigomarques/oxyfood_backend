import { FastifyInstance } from "fastify";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const orderController = new OrderController();

export async function orderRoutes(app: FastifyInstance) {
  app.post("/restaurants/:restaurantId/orders", orderController.create);

  app.get(
    "/restaurants/:restaurantId/orders",
    { onRequest: [authMiddleware] },
    orderController.listByRestaurant
  );

  app.patch(
    "/orders/:orderId/status",
    { onRequest: [authMiddleware] },
    orderController.updateStatus
  );

  app.get("/orders/:orderId/status", orderController.getStatus);

  app.get("/orders/:orderId", orderController.getDetails);
}
