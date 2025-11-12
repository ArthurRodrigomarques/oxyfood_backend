import { prisma } from "@/lib/prisma.js";
import { createRestaurantBodySchema } from "@/schemas/restaurant.schema.js";
import { Restaurant } from "@prisma/client";
import z from "zod";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type CreateRestaurantResquest = z.infer<typeof createRestaurantBodySchema> & {
  userId: string;
};

export class CreateRestaurantUseCase {
  async execute({
    userId,
    name,
    addressText,
    phoneNumber,
    pixKey,
    logoUrl,
    deliveryFee,
    freeDeliveryAbove,
  }: CreateRestaurantResquest): Promise<Restaurant> {
    const slug = generateSlug(name);

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        addressText,
        phoneNumber,
        pixKey,
        logoUrl,
        deliveryFee: deliveryFee || 0,
        freeDeliveryAbove: freeDeliveryAbove || null,
        userId: userId,
      },
    });

    return restaurant;
  }
}
