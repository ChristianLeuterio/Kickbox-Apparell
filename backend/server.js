import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import dns from "dns";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { connectDB } from "./lib/db.js";
import { redis } from "./lib/redis.js";

// ✅ Log environment variables safely
console.log("Mongo URI loaded:", !!process.env.MONGO_URI);
console.log("PayMongo key loaded:", !!process.env.PAYMONGO_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup — allow cookies from frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://kickbox-apparel.netlify.app", // add your deployed frontend URL here
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // ✅ allow cookies
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// ✅ Start server only after DB is connected
const startServer = async () => {
  try {
    await connectDB();

    // Ping Redis to confirm connection
    const pong = await redis.ping();
    console.log("Redis ping:", pong);

   app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
    
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
