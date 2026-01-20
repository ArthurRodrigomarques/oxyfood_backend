import { FastifyInstance } from "fastify";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const restaurantController = new RestaurantController();

export async function restaurantRoutes(app: FastifyInstance) {
  app.get(
    "/restaurants/id/:restaurantId",
    { onRequest: [authMiddleware] },
    restaurantController.getById,
  );

  app.get("/restaurants/:slug", restaurantController.getPublic);

  app.get(
    "/restaurants/:restaurantId/menu",
    { onRequest: [authMiddleware] },
    restaurantController.getMenu,
  );

  app.post(
    "/restaurants",
    { onRequest: [authMiddleware] },
    restaurantController.create,
  );

  app.put(
    "/restaurants/:restaurantId",
    { onRequest: [authMiddleware] },
    restaurantController.update,
  );

  app.put(
    "/restaurants/:restaurantId/opening-hours",
    { onRequest: [authMiddleware] },
    restaurantController.updateOpeningHours,
  );

  app.patch(
    "/restaurants/:restaurantId/toggle-status",
    { onRequest: [authMiddleware] },
    restaurantController.toggleStatus,
  );

  app.get(
    "/restaurants/:restaurantId/metrics",
    { onRequest: [authMiddleware] },
    restaurantController.getMetrics,
  );

  app.post(
    "/restaurants/:restaurantId/subscribe",
    { onRequest: [authMiddleware] },
    restaurantController.subscribe,
  );
}
