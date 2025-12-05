import { prisma } from "@/lib/prisma.js";

interface DeleteOptionGroupRequest {
  groupId: string;
  userId: string;
}

export class DeleteOptionGroupUseCase {
  async execute({ groupId, userId }: DeleteOptionGroupRequest): Promise<void> {
    const group = await prisma.optionGroup.findUnique({
      where: { id: groupId },
      include: {
        product: { include: { category: { include: { restaurant: true } } } },
      },
    });

    if (!group) throw new Error("Grupo não encontrado.");
    if (group.product.category.restaurant.userId !== userId)
      throw new Error("Não autorizado.");

    await prisma.optionGroup.delete({
      where: { id: groupId },
    });
  }
}
