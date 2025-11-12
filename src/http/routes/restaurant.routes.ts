import { FastifyInstance } from "fastify";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // O "PORTEIRO"

const restaurantController = new RestaurantController();

export async function restaurantRoutes(app: FastifyInstance) {
  app.post(
    "/restaurants",
    { onRequest: [authMiddleware] },
    restaurantController.create
  );
}
