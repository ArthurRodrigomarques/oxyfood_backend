import { z } from "zod";

export const createOptionGroupBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome do grupo precisa ter no mínimo 3 caracteres." }),

  type: z.enum(["SINGLE", "MULTIPLE"], {
    message: "O tipo deve ser 'SINGLE' ou 'MULTIPLE'.",
  }),

  minSelection: z.coerce
    .number()
    .int({ message: "A seleção mínima deve ser um número inteiro." })
    .min(0, { message: "A seleção mínima não pode ser negativa." }),

  maxSelection: z.coerce
    .number()
    .int({ message: "A seleção máxima deve ser pelo menos 1." })
    .min(1, { message: "A seleção máxima deve ser pelo menos 1." }),
});

export const createOptionGroupParamsSchema = z.object({
  productId: z.string().uuid({ message: "ID do produto inválido." }),
});

export const updateOptionGroupBodySchema = z.object({
  name: z.string().min(3).optional(),
  type: z.enum(["SINGLE", "MULTIPLE"]).optional(),
  minSelection: z.coerce.number().int().min(0).optional(),
  maxSelection: z.coerce.number().int().min(1).optional(),
});

export const optionGroupParamsSchema = z.object({
  groupId: z.string().uuid(),
});
