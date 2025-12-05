import { prisma } from "@/lib/prisma.js";
import { OptionGroup } from "@prisma/client";

interface UpdateOptionGroupRequest {
  groupId: string;
  userId: string;
  name?: string;
  type?: "SINGLE" | "MULTIPLE";
  minSelection?: number;
  maxSelection?: number;
}

export class UpdateOptionGroupUseCase {
  async execute({
    groupId,
    userId,
    ...data
  }: UpdateOptionGroupRequest): Promise<OptionGroup> {
    const group = await prisma.optionGroup.findUnique({
      where: { id: groupId },
      include: {
        product: { include: { category: { include: { restaurant: true } } } },
      },
    });

    if (!group) throw new Error("Grupo não encontrado.");
    if (group.product.category.restaurant.userId !== userId)
      throw new Error("Não autorizado.");

    return await prisma.optionGroup.update({
      where: { id: groupId },
      data,
    });
  }
}
