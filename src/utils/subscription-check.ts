import { Restaurant } from "@prisma/client";

export function isPlanExpired(restaurant: Restaurant): boolean {
  if (restaurant.plan === "ENTERPRISE") return false;
  if (!restaurant.planExpiresAt) return true;

  const now = new Date();
  const expiresAt = new Date(restaurant.planExpiresAt);

  return now > expiresAt;
}
