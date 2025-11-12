import { FastifyInstance } from "fastify";
import { OptionController } from "../controllers/option.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // O "PORTEIRO"

const optionController = new OptionController();

export async function optionRoutes(app: FastifyInstance) {
  app.post(
    "/option-groups/:optionGroupId/options",
    { onRequest: [authMiddleware] },
    optionController.create
  );
}
