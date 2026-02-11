import { FastifyReply, FastifyRequest } from "fastify";
import { CheckExpiredSubscriptionsUseCase } from "@/use-cases/subscription/check-expired-subscriptions.use-case.js";

export class SubscriptionCronController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const receivedSecret = request.headers["x-cron-secret"];
    const envSecret = process.env.CRON_SECRET;

    if (!envSecret || receivedSecret !== envSecret) {
      return reply
        .status(401)
        .send({ message: "Unauthorized: Invalid Cron Secret" });
    }

    const useCase = new CheckExpiredSubscriptionsUseCase();
    const result = await useCase.execute();

    return reply.status(200).send(result);
  }
}
