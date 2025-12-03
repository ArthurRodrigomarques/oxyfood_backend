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

export const updateRestaurantBodySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  addressText: z.string().min(10).optional(),
  phoneNumber: z.string().min(9).optional(),
  deliveryFee: z.number().nonnegative().optional(),
  freeDeliveryAbove: z.number().positive().optional().or(z.null()),
  pixKey: z.string().min(5).optional(),
});

export const updateRestaurantParamsSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const getPublicRestaurantParamsSchema = z.object({
  slug: z.string().min(1, { message: "O slug do restaurante é obrigatório." }),
});

export const toggleRestaurantStatusParamsSchema = z.object({
  restaurantId: z.string().uuid({ message: "ID do restaurante inválido." }),
});

export const toggleRestaurantStatusBodySchema = z.object({
  isOpen: z.boolean({
    error: "O status 'isOpen' (true/false) é obrigatório.",
  }),
});
