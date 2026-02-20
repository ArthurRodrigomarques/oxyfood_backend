import { z } from "zod";

export const createRestaurantBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
  addressText: z.string().min(10, { message: "A morada é muito curta." }),
  cpfCnpj: z.string().min(11, { message: "Documento inválido." }),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxDeliveryDistanceKm: z.number().positive().optional(),
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
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxDeliveryDistanceKm: z.number().positive().optional(),
  phoneNumber: z.string().min(9).optional(),
  cpfCnpj: z.string().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  freeDeliveryAbove: z.number().positive().optional().or(z.null()),
  deliveryTimeMin: z.number().min(1).optional(),
  deliveryTimeMax: z.number().min(1).optional(),
  pixKey: z.string().min(5).optional(),
  mercadoPagoAccessToken: z.string().optional(),
  logoUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .nullable(),
  bannerUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .nullable(),
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

export const createTableSchema = z.object({
  number: z.string().min(1, "O número/identificação da mesa é obrigatório"),
});
