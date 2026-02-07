// src/config/plans.ts

export const SUBSCRIPTION_PLANS = {
  START: {
    name: "Start",
    features: ["1 Unidade", "Cardápio Digital", "Gestão de Pedidos"],
    prices: {
      MONTHLY: 59.9,
      YEARLY: 599.0,
    },
    limits: {
      products: 100,
      orders: 500,
    },
  },
  PRO: {
    name: "Pro",
    features: ["3 Unidades", "Tudo do Start", "Relatórios Avançados"],
    prices: {
      MONTHLY: 119.9,
      YEARLY: 1199.0,
    },
    limits: {
      products: 1000,
      orders: 999999,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    features: ["Ilimitado", "Suporte 24h", "API Dedicada"],
    prices: {
      MONTHLY: 299.9,
      YEARLY: 2999.0,
    },
    limits: {
      products: 999999,
      orders: 999999,
    },
  },
} as const;
