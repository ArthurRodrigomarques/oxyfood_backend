import { FastifyInstance } from "fastify";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // 1. IMPORTAR O PORTEIRO

const orderController = new OrderController();

export async function orderRoutes(app: FastifyInstance) {
  app.post("/restaurants/:restaurantId/orders", orderController.create);

  app.get(
    "/restaurants/:restaurantId/orders",
    { onRequest: [authMiddleware] },
    orderController.listByRestaurant
  );
}
