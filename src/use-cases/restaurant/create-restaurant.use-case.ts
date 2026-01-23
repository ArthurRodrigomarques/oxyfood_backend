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

type CreateRestaurantRequest = z.infer<typeof createRestaurantBodySchema> & {
  userId: string;
};

export class CreateRestaurantUseCase {
  async execute({
    userId,
    name,
    addressText,
    cpfCnpj,
    phoneNumber,
    pixKey,
    logoUrl,
    deliveryFee,
    freeDeliveryAbove,
  }: CreateRestaurantRequest): Promise<Restaurant> {
    const existingRestaurants = await prisma.restaurant.findMany({
      where: {
        userId: userId,
      },
      select: { plan: true },
    });

    if (existingRestaurants.length > 0) {
      const hasEnterprisePlan = existingRestaurants.some(
        (r: { plan: string }) => r.plan === "ENTERPRISE",
      );

      if (!hasEnterprisePlan) {
        throw new Error(
          "Limite atingido! Faça upgrade para o plano ENTERPRISE para gerenciar múltiplas lojas.",
        );
      }
    }

    let slug = generateSlug(name);

    const slugExists = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (slugExists) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const now = new Date();
    const trialExpirationDate = new Date(now);
    trialExpirationDate.setDate(now.getDate() + 15);

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        addressText,
        cpfCnpj,
        phoneNumber,
        pixKey,
        logoUrl,
        deliveryFee: deliveryFee || 0,
        freeDeliveryAbove: freeDeliveryAbove || null,
        userId: userId,
        subscriptionStatus: "ACTIVE",
        plan: "PRO",
        planExpiresAt: trialExpirationDate,
        isOpen: false,
      },
    });

    return restaurant;
  }
}
