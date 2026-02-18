import { prisma } from "@/lib/prisma.js";
import { Coupon, DiscountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

interface CreateCouponRequest {
  restaurantId: string;
  code: string;
  description?: string;
  discountValue: number;
  discountType: DiscountType;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
}

export class CreateCouponUseCase {
  async execute({
    restaurantId,
    code,
    description,
    discountValue,
    discountType,
    minOrderValue,
    maxDiscount,
    usageLimit,
    expiresAt,
  }: CreateCouponRequest): Promise<Coupon> {
    const couponExists = await prisma.coupon.findFirst({
      where: {
        restaurantId,
        code: code.toUpperCase(),
      },
    });

    if (couponExists) {
      throw new Error(
        "Já existe um cupom com este código para este restaurante.",
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        restaurantId,
        code: code.toUpperCase(),
        description,
        discountValue: new Decimal(discountValue),
        discountType,
        minOrderValue: minOrderValue ? new Decimal(minOrderValue) : null,
        maxDiscount: maxDiscount ? new Decimal(maxDiscount) : null,
        usageLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    });

    return coupon;
  }
}
