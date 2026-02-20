import { prisma } from "@/lib/prisma.js";

interface CreateTableUseCaseRequest {
  restaurantId: string;
  number: string;
}

export class CreateTableUseCase {
  async execute({ restaurantId, number }: CreateTableUseCaseRequest) {
    const tableAlreadyExists = await prisma.table.findUnique({
      where: {
        restaurantId_number: {
          restaurantId,
          number,
        },
      },
    });

    if (tableAlreadyExists) {
      throw new Error("Já existe uma mesa com este número neste restaurante.");
    }

    const table = await prisma.table.create({
      data: {
        restaurantId,
        number,
        status: "AVAILABLE",
        isActive: true,
      },
    });

    return { table };
  }
}
