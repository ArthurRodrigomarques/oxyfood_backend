import { FastifyInstance } from "fastify";
import { ReviewController } from "../controllers/review.controller.js";

const reviewController = new ReviewController();

export async function reviewRoutes(app: FastifyInstance) {
  app.post("/restaurants/:restaurantId/reviews", reviewController.create);
  app.get("/restaurants/:restaurantId/reviews", reviewController.list);
}
