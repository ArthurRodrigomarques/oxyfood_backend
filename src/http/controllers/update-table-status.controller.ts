import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateTableStatusUseCase } from "@/use-cases/restaurant/update-table-status.use-case.js";
import {
  tableIdParamsSchema,
  updateTableStatusSchema,
} from "@/schemas/table.schema.js";

export async function updateTableStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId, tableId } = tableIdParamsSchema.parse(request.params);

  const { status } = updateTableStatusSchema.parse(request.body);

  try {
    const updateTableStatusUseCase = new UpdateTableStatusUseCase();

    const { table } = await updateTableStatusUseCase.execute({
      restaurantId,
      tableId,
      status,
    });

    return reply.status(200).send({ table });
  } catch (error: any) {
    return reply.status(400).send({ message: error.message });
  }
}
