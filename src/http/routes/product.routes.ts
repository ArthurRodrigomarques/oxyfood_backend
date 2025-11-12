import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // O "PORTEIRO"

const productController = new ProductController();

export async function productRoutes(app: FastifyInstance) {
  app.post(
    "/categories/:categoryId/products",
    { onRequest: [authMiddleware] },
    productController.create
  );
}
