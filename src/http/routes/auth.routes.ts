import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
}
