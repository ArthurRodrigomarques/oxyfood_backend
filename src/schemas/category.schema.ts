import z from "zod";

export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres" }),
});

export const createCategoryParamsSchema = z.object({
  restaurantId: z.string().uuid({ message: "ID do restaurante inválido" }),
});

export const deleteCategoryParamsSchema = z.object({
  categoryId: z.string().uuid({ message: "ID da categoria inválido." }),
});
