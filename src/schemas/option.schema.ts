import { z } from "zod";

export const createOptionBodySchema = z.object({
  name: z.string().min(1, { message: "O nome não pode estar vazio." }),

  priceDelta: z.coerce
    .number({ error: "O preço deve ser um número." })
    .min(0, { message: "O preço não pode ser negativo." }),
});

export const createOptionParamsSchema = z.object({
  optionGroupId: z
    .string()
    .uuid({ message: "ID do grupo de opcionais inválido." }),
});

export const updateOptionBodySchema = z.object({
  name: z.string().min(1).optional(),
  priceDelta: z.coerce.number().min(0).optional(),
});

export const optionParamsSchema = z.object({
  optionId: z.string().uuid(),
});
