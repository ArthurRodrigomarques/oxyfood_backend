import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const productController = new ProductController();

export async function productRoutes(app: FastifyInstance) {
  app.post(
    "/categories/:categoryId/products",
    { onRequest: [authMiddleware] },
    productController.create
  );

  app.put(
    "/products/:productId",
    { onRequest: [authMiddleware] },
    productController.update
  );

  app.delete(
    "/products/:productId",
    { onRequest: [authMiddleware] },
    productController.delete
  );
}
