import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
  description: z.string().optional(),

  basePrice: z.coerce
    .number({ error: "O preço base deve ser um número." })
    .positive({ message: "O preço base deve ser um valor positivo." }),
});

export const createProductParamsSchema = z.object({
  categoryId: z.string().uuid({ message: "ID da categoria inválido." }),
});
