// src/http/routes/whatsapp.routes.ts
import { FastifyInstance } from "fastify";
import { WhatsappController } from "@/http/controllers/whatsapp.controller.js";
import { authMiddleware as verifyJwt } from "@/http/middlewares/auth.middleware.js";

const whatsappController = new WhatsappController();

export async function whatsappRoutes(app: FastifyInstance) {
  // app.addHook("onRequest", verifyJwt);

  app.post(
    "/whatsapp/connect",
    whatsappController.connect.bind(whatsappController),
  );
  app.post(
    "/whatsapp/disconnect",
    whatsappController.disconnect.bind(whatsappController),
  );
}
