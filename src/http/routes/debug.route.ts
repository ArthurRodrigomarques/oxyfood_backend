import { FastifyInstance } from "fastify";
import { createCheckoutPreference } from "@/lib/mercado-pago.js";
import { prisma } from "@/lib/prisma.js";

export async function debugRoutes(app: FastifyInstance) {
  app.get("/debug/mp-link", async (request, reply) => {
    try {
      const restaurant = await prisma.restaurant.findFirst({
        where: { mercadoPagoAccessToken: { not: null } },
      });

      const token =
        restaurant?.mercadoPagoAccessToken || process.env.MP_ACCESS_TOKEN;

      if (!token) {
        return reply
          .status(400)
          .send("Nenhum token configurado (Banco ou ENV).");
      }

      const url = await createCheckoutPreference({
        items: [
          {
            id: "teste-debug-01",
            title: "Produto de Teste Cartao",
            quantity: 1,
            unit_price: 5.0,
          },
        ],
        deliveryFee: 0,
        payerEmail: "test_card_user@testuser.com",
        restaurantAccessToken: token,
        orderId: `debug-${Date.now()}`,
        restaurantId: restaurant?.id || "debug-restaurant",
      });

      return reply.type("text/html").send(`
        <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
            <h1>Teste de Cartão de Crédito</h1>
            <p>Token: ${token.slice(0, 10)}...</p>
            <a href="${url}" target="_blank" style="background: #009EE3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                PAGAR AGORA
            </a>
        </div>
      `);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  app.get("/debug-sentry", async (request, reply) => {
    throw new Error("Teste do Sentry no Backend Oxyfood! 🚨");
  });
}
