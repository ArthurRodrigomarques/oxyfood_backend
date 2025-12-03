import { prisma } from "@/lib/prisma.js";
import { Product } from "@prisma/client";

interface UpdateProductRequest {
  productId: string;
  userId: string;
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  available?: boolean;
}

export class UpdateProductUseCase {
  async execute({
    productId,
    userId,
    ...data
  }: UpdateProductRequest): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (product.category.restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return updatedProduct;
  }
}
