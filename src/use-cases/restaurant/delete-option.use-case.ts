import { prisma } from "@/lib/prisma.js";

interface DeleteOptionRequest {
  optionId: string;
  userId: string;
}

export class DeleteOptionUseCase {
  async execute({ optionId, userId }: DeleteOptionRequest): Promise<void> {
    const option = await prisma.option.findUnique({
      where: { id: optionId },
      include: {
        group: {
          include: {
            product: {
              include: { category: { include: { restaurant: true } } },
            },
          },
        },
      },
    });

    if (!option) throw new Error("Opção não encontrada.");
    if (option.group.product.category.restaurant.userId !== userId)
      throw new Error("Não autorizado.");

    await prisma.option.delete({
      where: { id: optionId },
    });
  }
}
