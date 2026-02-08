import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),

  description: z
    .string()
    .min(1, { message: "A descrição é obrigatória." })
    .min(5, { message: "A descrição deve ter no mínimo 5 caracteres." }),

  basePrice: z.coerce
    .number()
    .positive({ message: "O preço base deve ser um valor positivo." }),

  imageUrl: z.string().url({ message: "URL da imagem inválida." }),

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
