import { prisma } from "@/lib/prisma.js";
import { Decimal } from "@prisma/client/runtime/library";

interface ValidateCouponRequest {
  restaurantId: string;
  code: string;
  subTotal: number;
  customerPhone?: string;
}

export class ValidateCouponUseCase {
  async execute({
    restaurantId,
    code,
    subTotal,
    customerPhone,
  }: ValidateCouponRequest) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        restaurantId: restaurantId,
        active: true,
      },
    });

    if (!coupon) {
      throw new Error("Cupom inválido ou inativo.");
    }

    // Verifica se já foi usado por este cliente
    if (customerPhone) {
      const alreadyUsed = await prisma.order.findFirst({
        where: {
          restaurantId,
          customerPhone,
          couponId: coupon.id,
          status: { not: "CANCELED" },
        },
      });

      if (alreadyUsed) {
        throw new Error("Você já utilizou este cupom.");
      }
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new Error("Este cupom expirou.");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("O limite de usos deste cupom esgotou.");
    }

    const subTotalDecimal = new Decimal(subTotal);

    if (
      coupon.minOrderValue &&
      subTotalDecimal.lessThan(coupon.minOrderValue)
    ) {
      throw new Error(
        `Pedido mínimo para este cupom é R$ ${coupon.minOrderValue.toString()}`,
      );
    }

    let discountPrice = new Decimal(0);

    if (coupon.discountType === "PERCENTAGE") {
      discountPrice = subTotalDecimal.mul(coupon.discountValue.div(100));
      if (coupon.maxDiscount && discountPrice.greaterThan(coupon.maxDiscount)) {
        discountPrice = coupon.maxDiscount;
      }
    } else {
      discountPrice = coupon.discountValue;
    }

    if (discountPrice.greaterThan(subTotalDecimal)) {
      discountPrice = subTotalDecimal;
    }

    return {
      valid: true,
      discountAmount: discountPrice.toNumber(),
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.discountType,
    };
  }
}
