import { FastifyRequest, FastifyReply } from "fastify";
import { CreateProductUseCase } from "@/use-cases/restaurant/create-product.use-case.js";
import { UpdateProductUseCase } from "@/use-cases/restaurant/update-product.use-case.js";
import { DeleteProductUseCase } from "@/use-cases/restaurant/delete-product.use-case.js";
import {
  createProductBodySchema,
  createProductParamsSchema,
  updateProductBodySchema,
  productParamsSchema,
} from "@/schemas/product.schema.js";
import z from "zod";

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) throw new Error("Usuário não autenticado");
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
      return reply.status(400).send({ message: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { productId } = productParamsSchema.parse(request.params);
      const body = updateProductBodySchema.parse(request.body);

      const updateProduct = new UpdateProductUseCase();
      const product = await updateProduct.execute({
        productId,
        userId,
        ...body,
      });

      return reply.status(200).send({ product });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Erro de validação", errors: error.format() });
      }
      return reply.status(400).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { productId } = productParamsSchema.parse(request.params);

      const deleteProduct = new DeleteProductUseCase();
      await deleteProduct.execute({ productId, userId });

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
