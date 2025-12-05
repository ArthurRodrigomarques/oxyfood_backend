import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOptionGroupUseCase } from "@/use-cases/restaurant/create-option-group.use-case.js";
import {
  createOptionGroupBodySchema,
  createOptionGroupParamsSchema,
  optionGroupParamsSchema,
  updateOptionGroupBodySchema,
} from "@/schemas/option-group.schema.js";
import { z } from "zod";
import { DeleteOptionGroupUseCase } from "@/use-cases/restaurant/delete-option-group.use-case.js";
import { UpdateOptionGroupUseCase } from "@/use-cases/restaurant/update-option-group.use-case.js";

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

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { groupId } = optionGroupParamsSchema.parse(request.params);
      const body = updateOptionGroupBodySchema.parse(request.body);

      const updateUseCase = new UpdateOptionGroupUseCase();
      const group = await updateUseCase.execute({ groupId, userId, ...body });

      return reply.status(200).send({ group });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { groupId } = optionGroupParamsSchema.parse(request.params);

      const deleteUseCase = new DeleteOptionGroupUseCase();
      await deleteUseCase.execute({ groupId, userId });

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
