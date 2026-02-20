import { z } from "zod";

export const createTableSchema = z.object({
  number: z.string().min(1, "O número/identificação da mesa é obrigatório"),
});

export const tableParamsSchema = z.object({
  restaurantId: z.string().uuid("ID do restaurante inválido"),
});

export const tableIdParamsSchema = z.object({
  restaurantId: z.string().uuid("ID do restaurante inválido"),
  tableId: z.string().uuid("ID da mesa inválido"),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "OCCUPIED", "NEEDS_SERVICE"], {
    message: "Status inválido. Use AVAILABLE, OCCUPIED ou NEEDS_SERVICE.",
  }),
});
