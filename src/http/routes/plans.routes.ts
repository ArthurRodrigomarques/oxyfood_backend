import { FastifyInstance } from "fastify";
import { getPlans } from "../controllers/get-plans.controller.js";

export async function planRoutes(app: FastifyInstance) {
  app.get("/plans", getPlans);
}
