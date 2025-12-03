import { FastifyInstance } from "fastify";
import { CategoryController } from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const categoryController = new CategoryController();

export async function categoryRoutes(app: FastifyInstance) {
  app.post(
    "/restaurants/:restaurantId/categories",
    { onRequest: [authMiddleware] },
    categoryController.create
  );

  app.delete(
    "/categories/:categoryId",
    { onRequest: [authMiddleware] },
    categoryController.delete
  );
}
