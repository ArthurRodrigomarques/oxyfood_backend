import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { z } from "zod";

export class SuperAdminController {
  // 1. Dashboard
  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    const totalRestaurants = await prisma.restaurant.count();
    const totalOrders = await prisma.order.count();

    // Soma apenas pedidos "válidos" (não rejeitados)
    const totalRevenueAgg = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: { not: "REJECTED" },
      },
    });

    const activeRestaurants = await prisma.restaurant.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    const totalRevenue = Number(totalRevenueAgg._sum.totalPrice || 0);

    // Cálculo real do Ticket Médio Global
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return reply.send({
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      totalRevenue,
      averageTicket,
    });
  }

  // 2. Listar Todas as Lojas
  async listRestaurants(request: FastifyRequest, reply: FastifyReply) {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        subscriptionStatus: true,
        isOpen: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reply.send({ restaurants });
  }

  // 3. Alternar Status da Assinatura (Bloquear/Ativar Loja)
  async toggleSubscription(request: FastifyRequest, reply: FastifyReply) {
    const toggleSchema = z.object({
      restaurantId: z.string().uuid(),
    });

    const { restaurantId } = toggleSchema.parse(request.params);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return reply.status(404).send({ message: "Loja não encontrada." });
    }
    const newStatus =
      restaurant.subscriptionStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        subscriptionStatus: newStatus,
        isOpen: newStatus === "ACTIVE" ? restaurant.isOpen : false,
      },
    });

    return reply.status(204).send();
  }
}
