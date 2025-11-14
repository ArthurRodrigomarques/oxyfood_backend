import { z } from "zod";

export const createRestaurantBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
  addressText: z.string().min(10, { message: "A morada é muito curta." }),
  phoneNumber: z.string().min(9, { message: "Número de telefone inválido." }),
  pixKey: z.string().min(5, { message: "Chave Pix inválida." }),
  logoUrl: z
    .string()
    .url({ message: "URL do logo inválida." })
    .optional()
    .or(z.literal("")),
  deliveryFee: z.number().positive().optional(),
  freeDeliveryAbove: z.number().positive().optional(),
});

export const getPublicRestaurantParamsSchema = z.object({
  slug: z.string().min(1, { message: "O slug do restaurante é obrigatório." }),
});
