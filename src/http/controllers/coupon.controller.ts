import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateCouponUseCase } from "@/use-cases/restaurant/create-coupon.use-case.js";

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
}
