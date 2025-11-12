import { prisma } from "@/lib/prisma.js";
import { Product } from "@prisma/client";
import { z } from "zod";
import { createProductBodySchema } from "@/schemas/product.schema.js";

type CreateProductRequest = z.infer<typeof createProductBodySchema> & {
  categoryId: string;
  userId: string;
};

export class CreateProductUseCase {
  async execute({
    name,
    description,
    basePrice,
    categoryId,
    userId,
  }: CreateProductRequest): Promise<Product> {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        restaurant: true,
      },
    });

    if (!category) {
      throw new Error("Categoria não encontrada.");
    }

    if (category.restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice,
        categoryId: categoryId,
      },
    });

    return product;
  }
}
