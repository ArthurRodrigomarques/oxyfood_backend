import { FastifyInstance } from "fastify";
import { CouponController } from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const couponController = new CouponController();

export async function couponRoutes(app: FastifyInstance) {
  app.post(
    "/restaurants/:restaurantId/coupons",
    { onRequest: [authMiddleware] },
    couponController.create,
  );

  app.get(
    "/restaurants/:restaurantId/coupons",
    { onRequest: [authMiddleware] },
    couponController.list,
  );
}
