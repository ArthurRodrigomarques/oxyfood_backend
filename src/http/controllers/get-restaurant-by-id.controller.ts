import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GetRestaurantByIdUseCase } from "@/use-cases/restaurant/get-restaurant-by-id.use-case.js";

export async function getRestaurantById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = paramsSchema.parse(request.params);

  const useCase = new GetRestaurantByIdUseCase();
  const restaurant = await useCase.execute({ restaurantId: id });

  return reply.status(200).send(restaurant);
}
