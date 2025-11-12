import { prisma } from "@/lib/prisma.js";
import { OptionGroup } from "@prisma/client";
import { z } from "zod";
import { createOptionGroupBodySchema } from "@/schemas/option-group.schema.js";

type CreateOptionGroupRequest = z.infer<typeof createOptionGroupBodySchema> & {
  productId: string;
  userId: string;
};

export class CreateOptionGroupUseCase {
  async execute({
    name,
    type,
    minSelection,
    maxSelection,
    productId,
    userId,
  }: CreateOptionGroupRequest): Promise<OptionGroup> {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
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

    const optionGroup = await prisma.optionGroup.create({
      data: {
        name,
        type,
        minSelection,
        maxSelection,
        productId: productId,
      },
    });

    return optionGroup;
  }
}
