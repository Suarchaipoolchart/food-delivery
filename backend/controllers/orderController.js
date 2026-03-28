import Order from "../models/Order.js";
import Food from "../models/Food.js";
import mongoose from "mongoose";

// ==========================
// 🔥 HELPERS
// ==========================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ STATUS
const normalizeStatus = (status) => {
  if (!status) return "pending";

  const s = status.toLowerCase();

  if (s.includes("received") || s.includes("pending")) return "pending";
  if (s.includes("preparing")) return "preparing";
  if (s.includes("on the way")) return "on_the_way";
  if (s.includes("delivered") || s.includes("complete")) return "delivered";

  return "pending";
};

// ✅ PAYMENT STATUS
const normalizePayment = (p) => {
  if (!p) return "pending";

  const s = p.toLowerCase();

  if (s.includes("paid")) return "paid";
  if (s.includes("fail")) return "failed";

  return "pending";
};

// 🔥 ตัวที่ขาดไป (ตัวปัญหา)
const normalizePaymentMethod = (method) => {
  if (!method) return "cash";

  const m = method.toLowerCase();

  if (m.includes("cash")) return "cash";
  if (m.includes("transfer")) return "transfer";

  return "cash";
};

// ==========================
// ✅ GET ALL
// ==========================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("foods.food", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR 💥:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ✅ GET BY ID
// ==========================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("foods.food", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("GET ORDER BY ID ERROR 💥:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ✅ CREATE ORDER (🔥 FIX ALL)
// ==========================
export const createOrder = async (req, res) => {
  try {
    let { foods, user, paymentMethod } = req.body;

    // parse foods
    if (typeof foods === "string") {
      foods = JSON.parse(foods);
    }

    // validate foods
    const cleanFoods =
      foods
        ?.filter((f) => f.food && isValidId(f.food))
        .map((f) => ({
          food: new mongoose.Types.ObjectId(f.food),
          qty: Math.max(1, Number(f.qty) || 1),
        })) || [];

    if (cleanFoods.length === 0) {
      return res.status(400).json({ message: "No valid foods" });
    }

    // ==========================
    // 💰 CALCULATE PRICE (เร็วขึ้น)
    // ==========================
    const foodIds = cleanFoods.map((f) => f.food);

    const foodDocs = await Food.find({ _id: { $in: foodIds } });

    let totalPrice = 0;

    cleanFoods.forEach((item) => {
      const food = foodDocs.find(
        (f) => f._id.toString() === item.food.toString()
      );
      if (food) totalPrice += food.price * item.qty;
    });

    // ==========================
    // ⏱ ETA
    // ==========================
    const eta = Math.floor(10 + Math.random() * 10);

    // ==========================
    // 🚚 rider
    // ==========================
    const riderLocation = {
      lat: 14.073,
      lng: 100.608,
    };

    const slip = req.file ? req.file.filename : null;

    const order = await Order.create({
      user,
      foods: cleanFoods,
      totalPrice,
      paymentMethod: normalizePaymentMethod(paymentMethod), // 🔥 FIX สำคัญ
      slip,
      paymentStatus: normalizePayment(slip ? "paid" : "pending"),
      status: "pending",
      eta,
      riderLocation,
    });

    const populatedOrder = await order.populate("foods.food user");

    if (global.io) {
      global.io.emit("order:new", populatedOrder);
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("CREATE ORDER ERROR 💥:", error);
    res.status(400).json({ message: error.message });
  }
};

// ==========================
// ✅ UPDATE ORDER
// ==========================
export const updateOrder = async (req, res) => {
  try {
    if (req.body.status) {
      req.body.status = normalizeStatus(req.body.status);
    }

    if (req.body.paymentStatus) {
      req.body.paymentStatus = normalizePayment(req.body.paymentStatus);
    }

    if (req.body.paymentMethod) {
      req.body.paymentMethod = normalizePaymentMethod(
        req.body.paymentMethod
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("foods.food user");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (global.io) {
      global.io.emit("order:update", updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("UPDATE ORDER ERROR 💥:", error);
    res.status(400).json({ message: error.message });
  }
};

// ==========================
// 🔥 UPDATE STATUS (ADMIN)
// ==========================
export const updateOrderStatus = async (req, res) => {
  try {
    const normalized = normalizeStatus(req.body.status);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: normalized },
      { new: true }
    ).populate("foods.food user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (global.io) {
      global.io.emit("order:update", order);
    }

    res.json(order);
  } catch (error) {
    console.error("UPDATE STATUS ERROR 💥:", error);
    res.status(400).json({ message: error.message });
  }
};

// ==========================
// ✅ DELETE
// ==========================
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (global.io) {
      global.io.emit("order:delete", deleted._id);
    }

    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("DELETE ORDER ERROR 💥:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ✅ GET USER ORDERS
// ==========================
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate("foods.food", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("GET USER ORDERS ERROR 💥:", error);
    res.status(500).json({ message: error.message });
  }
};