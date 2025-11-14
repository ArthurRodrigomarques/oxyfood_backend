import { FastifyRequest, FastifyReply } from "fastify";
import { CreateRestaurantUseCase } from "@/use-cases/restaurant/create-restaurant.use-case.js";
import { GetPublicRestaurantUseCase } from "@/use-cases/restaurant/get-public-restaurant.use-case.js";
import { ToggleRestaurantStatusUseCase } from "@/use-cases/restaurant/toggle-restaurant-status.use-case.js";
import {
  createRestaurantBodySchema,
  getPublicRestaurantParamsSchema,
  toggleRestaurantStatusBodySchema,
  toggleRestaurantStatusParamsSchema,
} from "@/schemas/restaurant.schema.js";

import { z } from "zod";

export class RestaurantController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
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

  async getPublic(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = getPublicRestaurantParamsSchema.parse(request.params);
      const getRestaurant = new GetPublicRestaurantUseCase();
      const { restaurant } = await getRestaurant.execute({ slug });
      return reply.status(200).send({ restaurant });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(404).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async toggleStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { restaurantId } = toggleRestaurantStatusParamsSchema.parse(
        request.params
      );

      const { isOpen } = toggleRestaurantStatusBodySchema.parse(request.body);

      const toggleStatus = new ToggleRestaurantStatusUseCase();
      const updatedRestaurant = await toggleStatus.execute({
        restaurantId,
        isOpen,
        userId,
      });

      return reply.status(200).send({ restaurant: updatedRestaurant });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Erro de validação.", errors: error.format() });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
