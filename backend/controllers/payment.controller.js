import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import axios from "axios";

// 🟢 Create Checkout Session with PayMongo
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode, userId } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    // Build line items for PayMongo
    const lineItems = products.map((product) => {
      const price = Number(product.price) || 0;
      const quantity = Number(product.quantity) || 1;
      const amount = Math.round(price * 100); // centavos
      totalAmount += amount * quantity;

      return {
        name: product.name || "Unnamed Product",
        amount,
        currency: "PHP",
        quantity,
      };
    });

    // Handle coupon
    if (couponCode && userId) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        userId,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
      }
    }

    // ✅ Create PayMongo checkout session (redirect supported)
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
              userId: userId || "",
              couponCode: couponCode || "",
              products: JSON.stringify(
                products.map((p) => ({
                  id: p._id,
                  name: p.name,
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
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Reward coupon for large purchases
    if (totalAmount >= 20000 && userId) {
      await createNewCoupon(userId);
    }

    // ✅ Return the PayMongo Checkout URL
    res.status(200).json({
      url: response.data.data.attributes.checkout_url,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error processing PayMongo checkout:", error.message);
    res.status(500).json({ message: "Error processing checkout", error: error.message });
  }
};

// 🟢 Handle Successful Checkout
export const checkoutSuccess = async (req, res) => {
  try {
    const { userId, products, couponCode } = req.body;

    if (couponCode && userId) {
      await Coupon.findOneAndUpdate(
        { code: couponCode, userId },
        { isActive: false }
      );
    }

    const parsedProducts = typeof products === "string" ? JSON.parse(products) : products;
    const newOrder = new Order({
      user: userId || null,
      products: parsedProducts.map((product) => ({
        product: product.id,
        quantity: product.quantity || 1,
        price: product.price || 0,
      })),
      totalAmount: parsedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
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
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    userId,
  });

  await newCoupon.save();
  return newCoupon;
}