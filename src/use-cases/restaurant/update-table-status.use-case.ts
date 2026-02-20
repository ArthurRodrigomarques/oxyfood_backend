import { prisma } from "@/lib/prisma.js";
import { TableStatus } from "@prisma/client";

interface UpdateTableStatusUseCaseRequest {
  restaurantId: string;
  tableId: string;
  status: TableStatus;
}

export class UpdateTableStatusUseCase {
  async execute({
    restaurantId,
    tableId,
    status,
  }: UpdateTableStatusUseCaseRequest) {
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

    const updatedTable = await prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        status,
      },
    });

    return { table: updatedTable };
  }
}
