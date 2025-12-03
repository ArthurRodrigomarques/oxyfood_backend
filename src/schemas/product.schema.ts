import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
  description: z.string().optional(),

  basePrice: z.coerce
    .number({ error: "O preço base deve ser um número." })
    .positive({ message: "O preço base deve ser um valor positivo." }),

  imageUrl: z.string().optional(),
  available: z.boolean().optional(),
});

export const createProductParamsSchema = z.object({
  categoryId: z.string().uuid({ message: "ID da categoria inválido." }),
});

export const updateProductBodySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  available: z.boolean().optional(),
});

export const productParamsSchema = z.object({
  productId: z.string().uuid({ message: "ID do produto inválido." }),
});
