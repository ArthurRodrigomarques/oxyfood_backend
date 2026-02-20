import { prisma } from "@/lib/prisma.js";

interface ListTablesUseCaseRequest {
  restaurantId: string;
}

export class ListTablesUseCase {
  async execute({ restaurantId }: ListTablesUseCaseRequest) {
    const tables = await prisma.table.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        number: "asc",
      },
    });

    return { tables };
  }
}
