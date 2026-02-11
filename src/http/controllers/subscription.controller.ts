import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "@/use-cases/restaurant/create-subscription.use-case.js";
import { CancelSubscriptionUseCase } from "@/use-cases/subscription/cancel-subscription.use-case.js";

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
    billingType: z
      .enum(["PIX", "CREDIT_CARD", "UNDEFINED"])
      .default("UNDEFINED"),

    creditCard: z
      .object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      })
      .optional(),

    creditCardHolderInfo: z
      .object({
        name: z.string(),
        email: z.string(),
        cpfCnpj: z.string(),
        postalCode: z.string(),
        addressNumber: z.string(),
        phone: z.string(),
      })
      .optional(),
  });

  const { plan, billingCycle, billingType, creditCard, creditCardHolderInfo } =
    bodySchema.parse(request.body);

  const userId = (request as any).user.sub;

  const useCase = new CreateSubscriptionUseCase();

  const result = await useCase.execute({
    restaurantId,
    userId,
    plan,
    billingCycle,
    billingType,
    creditCard,
    creditCardHolderInfo,
  });

  return reply.status(201).send(result);
}

export async function cancelSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply
      .status(401)
      .send({ message: "Falha na autenticação: Token inválido." });
  }

  const user = (request as any).user;
  const useCase = new CancelSubscriptionUseCase();

  try {
    await useCase.execute({
      userId: user.sub,
    });
    return reply
      .status(200)
      .send({ message: "Assinatura cancelada com sucesso." });
  } catch (error: any) {
    console.error("Erro no cancelamento:", error);
    return reply.status(400).send({ message: error.message });
  }
}
