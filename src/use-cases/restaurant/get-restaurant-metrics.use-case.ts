import { prisma } from "@/lib/prisma.js";
import { OrderStatus } from "@prisma/client";

interface GetRestaurantMetricsRequest {
  restaurantId: string;
  userId: string;
  days?: number;
}

export class GetRestaurantMetricsUseCase {
  async execute({
    restaurantId,
    userId,
    days = 30,
  }: GetRestaurantMetricsRequest) {
    // 1. Verifica segurança
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) throw new Error("Restaurante não encontrado.");
    if (restaurant.userId !== userId) throw new Error("Não autorizado.");

    // Filtro de Data (Últimos 30 dias por exemplo)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 2. Busca Pedidos Concluídos (Para Receita)
    const completedOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    // 3. Calcula Totais
    const totalRevenue = completedOrders.reduce(
      (acc, order) => acc + Number(order.totalPrice),
      0
    );

    const totalOrdersCount = completedOrders.length;
    const averageTicket =
      totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const uniqueCustomers = new Set(completedOrders.map((o) => o.customerPhone))
      .size;

    // 5. Top Produtos Mais Vendidos
    const productSales: Record<
      string,
      { name: string; qty: number; revenue: number }
    > = {};

    completedOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.product.name,
            qty: 0,
            revenue: 0,
          };
        }
        productSales[productId].qty += item.quantity;
        productSales[productId].revenue +=
          Number(item.unitPrice) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const recentOrders = await prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        customerName: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: { quantity: true },
        },
      },
    });

    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      date: order.createdAt,
      customer: order.customerName,
      items: order.orderItems.reduce((acc, i) => acc + i.quantity, 0),
      total: Number(order.totalPrice),
      status: order.status,
    }));

    return {
      revenue: totalRevenue,
      ordersCount: totalOrdersCount,
      averageTicket,
      activeCustomers: uniqueCustomers,
      topProducts,
      recentOrders: formattedRecentOrders,
    };
  }
}
