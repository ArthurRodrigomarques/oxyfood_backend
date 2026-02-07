import { FastifyReply, FastifyRequest } from "fastify";
import { SUBSCRIPTION_PLANS } from "../../config/plans.js";

export async function getPlans(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(200).send(SUBSCRIPTION_PLANS);
}
