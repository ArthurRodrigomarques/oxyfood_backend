import { prisma } from "@/lib/prisma.js";

interface GetMetricsRequest {
  restaurantId: string;
  userId: string;
}

export class GetRestaurantMetricsUseCase {
  async execute({ restaurantId, userId }: GetMetricsRequest) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (restaurant.userId !== userId) {
      throw new Error("Acesso não autorizado.");
    }

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          not: "REJECTED",
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const revenue = orders.reduce((acc, order) => {
      return acc + Number(order.totalPrice);
    }, 0);

    const ordersCount = orders.length;

    const averageTicket = ordersCount > 0 ? revenue / ordersCount : 0;

    const uniqueCustomers = new Set(orders.map((o) => o.customerPhone));
    const activeCustomers = uniqueCustomers.size;

    const productSales = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId;
        const current = productSales.get(productId) || {
          name: item.product.name,
          qty: 0,
          revenue: 0,
        };

        current.qty += item.quantity;
        current.revenue += Number(item.unitPrice) * item.quantity;
        productSales.set(productId, current);
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 10).map((order) => ({
      id: order.id,
      date: order.createdAt,
      customer: order.customerName,
      items: order.orderItems.length,
      total: Number(order.totalPrice),
      status: order.status,
    }));

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayOrders = orders.filter((o) => {
        const oDate = new Date(o.createdAt);
        return oDate >= date && oDate < nextDate;
      });

      const dayRevenue = dayOrders.reduce(
        (acc, o) => acc + Number(o.totalPrice),
        0
      );
      const dayCount = dayOrders.length;

      const dayLabel = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });

      chartData.push({
        date: dayLabel,
        revenue: dayRevenue,
        orders: dayCount,
      });
    }

    return {
      revenue,
      ordersCount,
      averageTicket,
      activeCustomers,
      topProducts,
      recentOrders,
      chartData,
    };
  }
}
