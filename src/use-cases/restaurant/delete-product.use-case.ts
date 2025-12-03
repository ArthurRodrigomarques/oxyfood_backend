import { prisma } from "@/lib/prisma.js";

interface DeleteProductRequest {
  productId: string;
  userId: string;
}

export class DeleteProductUseCase {
  async execute({ productId, userId }: DeleteProductRequest): Promise<void> {
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

    await prisma.product.delete({
      where: { id: productId },
    });
  }
}
