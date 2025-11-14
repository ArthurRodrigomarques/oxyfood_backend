import { FastifyInstance } from "fastify";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // O "PORTEIRO"

const restaurantController = new RestaurantController();

export async function restaurantRoutes(app: FastifyInstance) {
  app.get("/restaurants/:slug", restaurantController.getPublic);

  app.post(
    "/restaurants",
    { onRequest: [authMiddleware] },
    restaurantController.create
  );

  app.patch(
    "/restaurants/:restaurantId/toggle-status",
    { onRequest: [authMiddleware] },
    restaurantController.toggleStatus
  );
}
