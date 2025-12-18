import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma.js";

export class SuperAdminController {
  // 1. Dashboard com Números Globais
  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    // Total de Restaurantes Cadastrados
    const totalRestaurants = await prisma.restaurant.count();

    // Total de Pedidos na Plataforma (Todas as lojas)
    const totalOrders = await prisma.order.count();

    // Faturamento Total (Soma de todos os pedidos finalizados)
    const totalRevenueAgg = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: { not: "REJECTED" }, // Ignora pedidos rejeitados
      },
    });

    // Lojas Ativas vs Inativas (Exemplo para SaaS)
    const activeRestaurants = await prisma.restaurant.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    return reply.send({
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      totalRevenue: totalRevenueAgg._sum.totalPrice || 0,
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
}
