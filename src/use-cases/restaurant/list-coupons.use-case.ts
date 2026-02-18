import { prisma } from "@/lib/prisma.js";
import { Coupon } from "@prisma/client";

interface ListCouponsRequest {
  restaurantId: string;
}

export class ListCouponsUseCase {
  async execute({ restaurantId }: ListCouponsRequest): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons;
  }
}
