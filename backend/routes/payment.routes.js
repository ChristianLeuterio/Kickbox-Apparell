import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout-success", checkoutSuccess);

// 🟢 Webhook endpoint for PayMongo
router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
  try {
    const event = req.body;

    if (event.data?.attributes?.type === "payment.paid") {
      const payment = event.data.attributes.data;
      const metadata = payment.attributes.metadata;

      await Order.findByIdAndUpdate(metadata.orderId, { status: "Paid" });

      // ✅ Deactivate coupon if used
      // if (metadata.couponCode) {
      //   await Coupon.findOneAndUpdate({ code: metadata.couponCode, userId: metadata.userId }, { isActive: false });
      // }

      console.log("Payment confirmed via webhook:", metadata);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
});

export default router;
