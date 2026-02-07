import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "@/use-cases/restaurant/create-subscription.use-case.js";

export async function createSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    restaurantId: z.string().uuid(),
  });
  const { restaurantId } = paramsSchema.parse(request.params);

  const bodySchema = z.object({
    plan: z.enum(["START", "PRO", "ENTERPRISE"]),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  });
  const { plan, billingCycle } = bodySchema.parse(request.body);

  const userId = (request as any).user.sub;

  const useCase = new CreateSubscriptionUseCase();

  const result = await useCase.execute({
    restaurantId,
    userId,
    plan,
    billingCycle,
  });

  return reply.status(201).send(result);
}
