import {
  createCategoryBodySchema,
  createCategoryParamsSchema,
} from "@/schemas/category.schema.js";
import { CreateCategoryUseCase } from "@/use-cases/restaurant/create-category.use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";

export class CategoryController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      const { restaurantId } = createCategoryParamsSchema.parse(request.params);

      const { name } = createCategoryBodySchema.parse(request.body);

      const createCategory = new CreateCategoryUseCase();
      const category = await createCategory.execute({
        name,
        restaurantId,
        userId,
      });

      return reply.status(201).send({ category });
    } catch (error) {
      return reply.status(500).send({ message: "erro de servidor" });
    }
  }
}
