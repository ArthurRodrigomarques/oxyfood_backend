import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userController = new UserController();

export async function userRoutes(app: FastifyInstance) {
  app.get("/me", { onRequest: [authMiddleware] }, userController.getProfile);
}
