import { FastifyReply, FastifyRequest } from "fastify";
import { DeleteTableUseCase } from "@/use-cases/restaurant/delete-table.use-case.js";
import { tableIdParamsSchema } from "@/schemas/table.schema.js";

export async function deleteTable(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId, tableId } = tableIdParamsSchema.parse(request.params);

  try {
    const deleteTableUseCase = new DeleteTableUseCase();

    await deleteTableUseCase.execute({
      restaurantId,
      tableId,
    });

    return reply.status(204).send();
  } catch (error: any) {
    return reply.status(400).send({ message: error.message });
  }
}
