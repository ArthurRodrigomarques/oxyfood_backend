import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { z } from "zod";

export class ReviewController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createReviewParams = z.object({
      restaurantId: z.string().uuid(),
    });

    const createReviewBody = z.object({
      customerName: z.string().min(1, "Nome é obrigatório"),
      stars: z.number().min(1).max(5),
      comment: z.string().optional(),
    });

    const { restaurantId } = createReviewParams.parse(request.params);
    const { customerName, stars, comment } = createReviewBody.parse(
      request.body
    );

    const review = await prisma.review.create({
      data: {
        restaurantId,
        customerName,
        stars,
        comment,
      },
    });

    return reply.status(201).send(review);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const listReviewParams = z.object({
      restaurantId: z.string().uuid(),
    });

    const { restaurantId } = listReviewParams.parse(request.params);

    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    const totalStars = reviews.reduce((acc, r) => acc + r.stars, 0);
    const average = reviews.length > 0 ? totalStars / reviews.length : 0;

    return reply.send({
      reviews,
      metrics: {
        total: reviews.length,
        average,
      },
    });
  }
}
