import { FastifyInstance } from "fastify";
import { createTable } from "../controllers/create-table.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { listTables } from "../controllers/list-tables.controller.js";
import { deleteTable } from "../controllers/delete-table.controller.js";
import { updateTableStatus } from "../controllers/update-table-status.controller.js";

export async function tableRoutes(app: FastifyInstance) {
  app.addHook("onRequest", authMiddleware);

  app.post("/restaurants/:restaurantId/tables", createTable);

  app.get("/restaurants/:restaurantId/tables", listTables);

  app.delete("/restaurants/:restaurantId/tables/:tableId", deleteTable);

  app.patch(
    "/restaurants/:restaurantId/tables/:tableId/status",
    updateTableStatus,
  );
}
