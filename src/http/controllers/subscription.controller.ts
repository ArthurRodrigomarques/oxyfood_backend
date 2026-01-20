import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "@/use-cases/restaurant/create-subscription.use-case.js";

export async function createSubscription(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const bodySchema = z.object({
    restaurantId: z.string().uuid(),
    userId: z.string().uuid(),
    plan: z.enum(["START", "PRO", "ENTERPRISE"]),
  });

  const { restaurantId, userId, plan } = bodySchema.parse(request.body);

  const useCase = new CreateSubscriptionUseCase();

  // Executa a criação da assinatura
  const result = await useCase.execute({
    restaurantId,
    userId,
    plan,
  });

  // Retorna o link de pagamento
  return reply.status(201).send(result);
}
