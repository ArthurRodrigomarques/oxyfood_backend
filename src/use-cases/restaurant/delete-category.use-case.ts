import { prisma } from "@/lib/prisma.js";

interface DeleteCategoryRequest {
  categoryId: string;
  userId: string;
}

export class DeleteCategoryUseCase {
  async execute({ categoryId, userId }: DeleteCategoryRequest): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    await prisma.category.delete({
      where: { id: categoryId },
    });
  }
}
