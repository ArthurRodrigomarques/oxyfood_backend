import { FastifyReply, FastifyRequest } from "fastify";
import { CheckExpiredSubscriptionsUseCase } from "@/use-cases/subscription/check-expired-subscriptions.use-case.js";
import { z } from "zod";

export class SubscriptionCronController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
      key: z.string(),
    });

    const { key } = querySchema.parse(request.query);
    if (key !== "segredo_do_admin_oxyfood") {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const useCase = new CheckExpiredSubscriptionsUseCase();
    const result = await useCase.execute();

    return reply.status(200).send(result);
  }
}
