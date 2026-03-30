import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";

// ==========================
// 🔥 HELPERS
// ==========================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeStatus = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase();

  if (s.includes("pending") || s.includes("received")) return "pending";
  if (s.includes("preparing")) return "preparing";
  if (s.includes("on the way")) return "on_the_way";
  if (s.includes("delivered") || s.includes("complete")) return "delivered";

  return "pending";
};

const normalizePayment = (p) => {
  if (!p) return "pending";
  const s = p.toLowerCase();

  if (s.includes("paid")) return "paid";
  if (s.includes("fail")) return "failed";

  return "pending";
};

const normalizePaymentMethod = (method) => {
  if (!method) return "cash";
  const m = method.toLowerCase();

  if (m.includes("cash")) return "cash";
  if (m.includes("transfer")) return "transfer";

  return "cash";
};

// ==========================
// 🔥 APPLY COUPON (SECURE)
// ==========================
const applyCouponToOrder = async (couponCode, userId, total) => {
  if (!couponCode) return { total, discount: 0 };

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
  });

  if (!coupon) throw new Error("Invalid coupon");

  if (!coupon.isActive) throw new Error("Coupon not active");

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error("Coupon expired");
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Coupon fully used");
  }

  if (
    userId &&
    coupon.claimedBy.some(
      (id) => id.toString() === userId.toString()
    )
  ) {
    throw new Error("You already used this coupon");
  }

  let discount = 0;

  if (coupon.type === "percent") {
    discount = (total * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }

  if (discount > total) discount = total;

  total -= discount;

  coupon.usedCount += 1;

  if (userId) {
    coupon.claimedBy.push(userId);
  }

  await coupon.save();

  return {
    total,
    discount,
    couponId: coupon._id,
  };
};

// ==========================
// ✅ CREATE ORDER
// ==========================
export const createOrder = async (req, res) => {
  try {
    let { foods, user, paymentMethod, coupon } = req.body;

    const userId = req.user?._id || user;

    if (typeof foods === "string") {
      foods = JSON.parse(foods);
    }

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

    const foodDocs = await Food.find({
      _id: { $in: cleanFoods.map((f) => f.food) },
    });

    let totalPrice = 0;

    cleanFoods.forEach((item) => {
      const food = foodDocs.find(
        (f) => f._id.toString() === item.food.toString()
      );
      if (food) totalPrice += food.price * item.qty;
    });

    let discount = 0;
    let couponId = null;

    if (coupon) {
      const result = await applyCouponToOrder(
        coupon,
        userId,
        totalPrice
      );

      totalPrice = result.total;
      discount = result.discount;
      couponId = result.couponId;
    }

    const order = await Order.create({
      user: userId,
      foods: cleanFoods,
      totalPrice,
      discount,
      coupon: couponId,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      slip: req.file?.filename || null,
      paymentStatus: normalizePayment(req.file ? "paid" : "pending"),
      status: "pending",
      eta: Math.floor(10 + Math.random() * 10),
      riderLocation: { lat: 14.073, lng: 100.608 },
    });

    const populated = await order.populate("foods.food user");

    if (global.io) {
      global.io.emit("order:new", populated);
    }

    res.status(201).json(populated);

  } catch (error) {
    console.error("CREATE ORDER ERROR 💥:", error);
    res.status(400).json({ message: error.message });
  }
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
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// ✅ UPDATE
// ==========================
export const updateOrder = async (req, res) => {
  try {
    if (req.body.status) {
      req.body.status = normalizeStatus(req.body.status);
    }

    if (req.body.paymentStatus) {
      req.body.paymentStatus = normalizePayment(req.body.paymentStatus);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("foods.food user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (global.io) {
      global.io.emit("order:update", order);
    }

    res.json(order);

  } catch (err) {
    res.status(400).json({ message: err.message });
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

  } catch (err) {
    res.status(500).json({ message: err.message });
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

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};