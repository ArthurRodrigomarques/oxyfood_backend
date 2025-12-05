import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOptionUseCase } from "@/use-cases/restaurant/create-option.use-case.js";
import {
  createOptionBodySchema,
  createOptionParamsSchema,
  optionParamsSchema,
  updateOptionBodySchema,
} from "@/schemas/option.schema.js";
import { z } from "zod";
import { UpdateOptionUseCase } from "@/use-cases/restaurant/update-option.use-case.js";
import { DeleteOptionUseCase } from "@/use-cases/restaurant/delete-option.use-case.js";

export class OptionController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { optionGroupId } = createOptionParamsSchema.parse(request.params);

      const body = createOptionBodySchema.parse(request.body);

      const createOption = new CreateOptionUseCase();
      const option = await createOption.execute({
        ...body,
        optionGroupId,
        userId,
      });

      return reply.status(201).send({ option });
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

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { optionId } = optionParamsSchema.parse(request.params);
      const body = updateOptionBodySchema.parse(request.body);

      const updateUseCase = new UpdateOptionUseCase();
      const option = await updateUseCase.execute({ optionId, userId, ...body });

      return reply.status(200).send({ option });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { optionId } = optionParamsSchema.parse(request.params);

      const deleteUseCase = new DeleteOptionUseCase();
      await deleteUseCase.execute({ optionId, userId });

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
