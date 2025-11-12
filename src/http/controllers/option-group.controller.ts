import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOptionGroupUseCase } from "@/use-cases/restaurant/create-option-group.use-case.js";
import {
  createOptionGroupBodySchema,
  createOptionGroupParamsSchema,
} from "@/schemas/option-group.schema.js";
import { z } from "zod";

export class OptionGroupController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { productId } = createOptionGroupParamsSchema.parse(request.params);

      const body = createOptionGroupBodySchema.parse(request.body);

      const createOptionGroup = new CreateOptionGroupUseCase();
      const optionGroup = await createOptionGroup.execute({
        ...body,
        productId,
        userId,
      });

      return reply.status(201).send({ optionGroup });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          message: "Erro de validação.",
          errors: error.format(),
        });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
