import { prisma } from "@/lib/prisma.js";
import { Option } from "@prisma/client";
import { z } from "zod";
import { createOptionBodySchema } from "@/schemas/option.schema.js";

type CreateOptionRequest = z.infer<typeof createOptionBodySchema> & {
  optionGroupId: string;
  userId: string;
};

export class CreateOptionUseCase {
  async execute({
    name,
    priceDelta,
    optionGroupId,
    userId,
  }: CreateOptionRequest): Promise<Option> {
    const optionGroup = await prisma.optionGroup.findUnique({
      where: {
        id: optionGroupId,
      },
      include: {
        product: {
          include: {
            category: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });

    if (!optionGroup) {
      throw new Error("Grupo de opcionais não encontrado.");
    }

    if (optionGroup.product.category.restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }
    const option = await prisma.option.create({
      data: {
        name,
        priceDelta,
        groupId: optionGroupId,
      },
    });

    return option;
  }
}
