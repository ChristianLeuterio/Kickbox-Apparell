import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import axios from "axios";

// 🟢 Create Checkout Session with PayMongo (verified endpoint)

export const createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    // Calculate total amount in centavos
    const totalAmount = products.reduce(
      (sum, p) => sum + Math.round(Number(p.price) * 100) * (Number(p.quantity) || 1),
      0
    );

    // ✅ Create a PayMongo Source (sandbox-compatible)
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: lineItems,
            payment_method_types: ["card", "gcash", "paymaya"],
            success_url: `${process.env.CLIENT_URL}/purchase-success`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            metadata: {
              userId: req.user._id.toString(),
              couponCode: couponCode || "",
              products: JSON.stringify(
                products.map((p) => ({
                  id: p._id,
                  quantity: p.quantity || 1,
                  price: p.price || 0,
                }))
              ),
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Return the redirect URL
    res.status(200).json({
      url: response.data.data.attributes.redirect.checkout_url,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("PayMongo error response:", JSON.stringify(error.response?.data || error.message, null, 2));
    res.status(500).json({ error: error.response?.data || error.message });
  }
};



// 🟢 Handle Successful Checkout (PayMongo webhook recommended)
export const checkoutSuccess = async (req, res) => {
  try {
    const { userId, products, couponCode } = req.body;

    if (couponCode && userId) {
      await Coupon.findOneAndUpdate(
        { code: couponCode, userId },
        { isActive: false }
      );
    }

    let parsedProducts = [];
    if (products) {
      try {
        parsedProducts = typeof products === "string" ? JSON.parse(products) : products;
      } catch (err) {
        console.error("❌ Failed to parse products:", err.message);
        return res.status(400).json({ message: "Invalid products format" });
      }
    }

    const newOrder = new Order({
      user: userId || null,
      products: parsedProducts.map((product) => ({
        product: product.id,
        quantity: product.quantity || 1,
        price: product.price || 0,
      })),
      totalAmount: parsedProducts.reduce(
        (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
        0
      ),
      paymongoSessionId: req.body.sessionId || null,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment successful, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error.message);
    res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
};

// 🟢 Helper: Create New Coupon for Loyal Users
async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId,
  });

  await newCoupon.save();
  return newCoupon;
}