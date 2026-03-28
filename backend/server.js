import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize"; // ✅ ใช้ตัวนี้
import { Server } from "socket.io";

// ✅ DB
import connectDB from "./config/db.js";

// =========================
// 🔥 LOAD ENV
// =========================
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// =========================
// 🔥 CONNECT DB
// =========================
connectDB();

// =========================
// 🔥 IMPORT ROUTES
// =========================
import Order from "./models/Order.js";

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

// =========================
// 🔥 APP INIT
// =========================
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

// =========================
// 🔥 SECURITY MIDDLEWARE
// =========================

// 🛡️ Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 🌐 CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 📦 Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚫 NoSQL Injection
app.use((req, res, next) => {
  if (req.body) Object.assign(req.body, mongoSanitize(req.body));
  if (req.query) Object.assign(req.query, mongoSanitize(req.query));
  if (req.params) Object.assign(req.params, mongoSanitize(req.params));
  next();
});

// 🚫 XSS Protection (✅ FIX ใหม่ ไม่พัง)
const cleanXSS = (obj) => {
  if (!obj) return;

  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/<.*?>/g, "");
    } else if (typeof obj[key] === "object") {
      cleanXSS(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  cleanXSS(req.body);
  cleanXSS(req.query);
  cleanXSS(req.params);
  next();
});

// 🚫 Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, try again later",
});
app.use(limiter);

// =========================
// 🔥 SOCKET.IO
// =========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// =========================
// 🔥 UPLOADS
// =========================
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use("/uploads", express.static(uploadPath));

// =========================
// 🔥 ROUTES
// =========================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);

// =========================
// 🔥 RIDER LOOP
// =========================
setInterval(async () => {
  try {
    const orders = await Order.find({ status: "On the way" });

    for (let order of orders) {
      if (!order.riderLocation) continue;

      order.riderLocation.lat += (Math.random() - 0.5) * 0.001;
      order.riderLocation.lng += (Math.random() - 0.5) * 0.001;

      if (order.eta && Date.now() >= new Date(order.eta).getTime()) {
        order.status = "Delivered";
      }

      await order.save();

      if (global.io) {
        global.io.emit("order:update", order);
      }
    }
  } catch (err) {
    console.log("RIDER LOOP ERROR 💥:", err.message);
  }
}, 10000);

// =========================
// 🔥 ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR 💥:", err);

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

// =========================
// 🔥 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});