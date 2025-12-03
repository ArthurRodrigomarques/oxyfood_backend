import {
  createCategoryBodySchema,
  createCategoryParamsSchema,
  deleteCategoryParamsSchema,
} from "@/schemas/category.schema.js";
import { CreateCategoryUseCase } from "@/use-cases/restaurant/create-category.use-case.js";
import { DeleteCategoryUseCase } from "@/use-cases/restaurant/delete-category.use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";

export class CategoryController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { restaurantId } = createCategoryParamsSchema.parse(request.params);
      const { name } = createCategoryBodySchema.parse(request.body);
      const createFn = new CreateCategoryUseCase();
      const category = await createFn.execute({ name, restaurantId, userId });
      return reply.status(201).send({ category });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { categoryId } = deleteCategoryParamsSchema.parse(request.params);

      const deleteCategory = new DeleteCategoryUseCase();
      await deleteCategory.execute({ categoryId, userId });

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
