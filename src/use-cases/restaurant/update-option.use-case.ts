import { prisma } from "@/lib/prisma.js";
import { Option } from "@prisma/client";

interface UpdateOptionRequest {
  optionId: string;
  userId: string;
  name?: string;
  priceDelta?: number;
}

export class UpdateOptionUseCase {
  async execute({
    optionId,
    userId,
    ...data
  }: UpdateOptionRequest): Promise<Option> {
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

    return await prisma.option.update({
      where: { id: optionId },
      data,
    });
  }
}
