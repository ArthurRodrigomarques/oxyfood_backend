import { createRestaurantBodySchema } from "@/schemas/restaurant.schema.js";
import { CreateRestaurantUseCase } from "@/use-cases/restaurant/create-restaurant.use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";

export class RestaurantController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado falha no middleware)");
      }

      const body = createRestaurantBodySchema.parse(request.body);

      const createRestaurant = new CreateRestaurantUseCase();
      const restaurant = await createRestaurant.execute({
        ...body,
        userId: userId,
      });

      return reply.status(201).send({ restaurant });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
