import { FastifyInstance } from "fastify";
import { SuperAdminController } from "../controllers/super-admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyUserRole } from "../middlewares/verify-user-role.js";

const superAdminController = new SuperAdminController();

export async function superAdminRoutes(app: FastifyInstance) {
  app.addHook("onRequest", authMiddleware);
  app.addHook("onRequest", verifyUserRole("SUPER_ADMIN"));

  app.get("/admin/metrics", superAdminController.getMetrics);
  app.get("/admin/restaurants", superAdminController.listRestaurants);
}
