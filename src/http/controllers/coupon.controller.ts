import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateCouponUseCase } from "@/use-cases/restaurant/create-coupon.use-case.js";
import { ListCouponsUseCase } from "@/use-cases/restaurant/list-coupons.use-case.js";

export class CouponController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createCouponBodySchema = z.object({
      code: z.string().min(3),
      description: z.string().optional(),
      discountValue: z.number().positive(),
      discountType: z.enum(["PERCENTAGE", "FIXED"]),
      minOrderValue: z.number().optional(),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().int().optional(),
      expiresAt: z.string().datetime().optional(),
    });

    const { restaurantId } = request.params as { restaurantId: string };
    const data = createCouponBodySchema.parse(request.body);

    const useCase = new CreateCouponUseCase();
    const coupon = await useCase.execute({ ...data, restaurantId });

    return reply.status(201).send(coupon);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const listCouponsParamsSchema = z.object({
      restaurantId: z.string().uuid(),
    });

    const { restaurantId } = listCouponsParamsSchema.parse(request.params);

    const useCase = new ListCouponsUseCase();
    const coupons = await useCase.execute({ restaurantId });

    return reply.status(200).send(coupons);
  }
}
