import { FastifyReply, FastifyRequest } from "fastify";
import { ListTablesUseCase } from "@/use-cases/restaurant/list-tables.use-case.js";
import { tableParamsSchema } from "@/schemas/table.schema.js";

export async function listTables(request: FastifyRequest, reply: FastifyReply) {
  const { restaurantId } = tableParamsSchema.parse(request.params);

  const listTablesUseCase = new ListTablesUseCase();

  const { tables } = await listTablesUseCase.execute({
    restaurantId,
  });

  return reply.status(200).send({ tables });
}
