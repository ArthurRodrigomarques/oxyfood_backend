import { prisma } from "@/lib/prisma.js";
import { Category } from "@prisma/client";

interface CreateCategoryRequest {
  name: string;
  restaurantId: string;
  userId: string;
}

export class CreateCategoryUseCase {
  async execute({
    name,
    restaurantId,
    userId,
  }: CreateCategoryRequest): Promise<Category> {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const category = await prisma.category.create({
      data: {
        name,
        restaurantId: restaurantId,
      },
    });

    return category;
  }
}
