import { FastifyInstance } from "fastify";
import { OrderController } from "../controllers/order.controller.js";

const orderController = new OrderController();

export async function orderRoutes(app: FastifyInstance) {
  app.post("/restaurants/:restaurantId/orders", orderController.create);
}
