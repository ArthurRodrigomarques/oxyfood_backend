import { prisma } from "@/lib/prisma.js";

interface DeleteTableUseCaseRequest {
  restaurantId: string;
  tableId: string;
}

export class DeleteTableUseCase {
  async execute({ restaurantId, tableId }: DeleteTableUseCaseRequest) {
    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
      },
    });

    if (!table || table.restaurantId !== restaurantId) {
      throw new Error(
        "Mesa não encontrada ou não pertence a este restaurante.",
      );
    }

    await prisma.table.delete({
      where: {
        id: tableId,
      },
    });
  }
}
