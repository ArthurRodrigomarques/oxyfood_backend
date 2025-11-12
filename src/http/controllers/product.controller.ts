import { FastifyRequest, FastifyReply } from "fastify";
import { CreateProductUseCase } from "@/use-cases/restaurant/create-product.use-case.js";
import {
  createProductBodySchema,
  createProductParamsSchema,
} from "@/schemas/product.schema.js";
import z from "zod";

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { categoryId } = createProductParamsSchema.parse(request.params);

      const body = createProductBodySchema.parse(request.body);

      const createProduct = new CreateProductUseCase();
      const product = await createProduct.execute({
        ...body,
        categoryId,
        userId,
      });

      return reply.status(201).send({ product });
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
