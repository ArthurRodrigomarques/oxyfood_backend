import { FastifyInstance } from "fastify";
import { OptionGroupController } from "../controllers/option-group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const optionGroupController = new OptionGroupController();

export async function optionGroupRoutes(app: FastifyInstance) {
  app.post(
    "/products/:productId/option-groups",
    { onRequest: [authMiddleware] },
    optionGroupController.create
  );

  app.put(
    "/option-groups/:groupId",
    { onRequest: [authMiddleware] },
    optionGroupController.update
  );

  app.delete(
    "/option-groups/:groupId",
    { onRequest: [authMiddleware] },
    optionGroupController.delete
  );
}
