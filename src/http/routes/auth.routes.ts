import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.post("/auth/forgot-password", authController.forgotPassword);
  app.post("/auth/reset-password", authController.resetPassword);
}
