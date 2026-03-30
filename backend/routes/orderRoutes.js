import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js"; // 🔥 FIX: ต้อง import

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders
} from "../controllers/orderController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// ==========================
// 🔥 helper กัน id พัง
// ==========================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================
// 🔥 GET ALL (admin)
// ==========================
router.get("/", getOrders);

// ==========================
// 🔥 GET USER ORDERS
// ==========================
// ⚠️ ต้องอยู่ก่อน /:id
router.get(
  "/user/:id",
  (req, res, next) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    next();
  },
  getUserOrders
);

// ==========================
// 🔥 GET BY ID
// ==========================
router.get(
  "/:id",
  (req, res, next) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    next();
  },
  getOrderById
);

// ==========================
// 🔥 CREATE ORDER (upload slip)
// ==========================
router.post("/", upload.single("slip"), createOrder);

// ==========================
// 🔥 UPDATE ORDER
// ==========================
router.put(
  "/:id",
  (req, res, next) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    next();
  },
  updateOrder
);

// ==========================
// 🔥 UPDATE RIDER LOCATION
// ==========================
router.put("/:id/location", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { riderLocation: req.body },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (global.io) {
      global.io.emit("order:update", order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// 🔥 DELETE ORDER
// ==========================
router.delete(
  "/:id",
  (req, res, next) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    next();
  },
  deleteOrder
);

export default router;