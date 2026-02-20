import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateTableUseCase } from "@/use-cases/restaurant/create-table.use-case.js";
// Ajuste o caminho de importação abaixo conforme o ficheiro schema que criámos anteriormente
import { createTableSchema } from "@/schemas/table.schema.js";

export async function createTable(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createTableParamsSchema = z.object({
    restaurantId: z.string().uuid(),
  });

  const { restaurantId } = createTableParamsSchema.parse(request.params);

  const { number } = createTableSchema.parse(request.body);

  try {
    const createTableUseCase = new CreateTableUseCase();

    const { table } = await createTableUseCase.execute({
      restaurantId,
      number,
    });

    return reply.status(201).send({ table });
  } catch (error: any) {
    return reply.status(400).send({ message: error.message });
  }
}
