import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Coupon from "../models/Coupon.js"; // 🔥 เพิ่ม
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
// 🔥 APPLY COUPON (HELPER)
// ==========================
const applyCouponToOrder = async (couponCode, userId, total) => {
  if (!couponCode) return { total, discount: 0 };

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
  });

  if (!coupon) throw new Error("Invalid coupon");

  // 🔒 VALIDATE
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

  // 💰 CALCULATE
  let discount = 0;

  if (coupon.type === "percent") {
    discount = (total * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }

  if (discount > total) discount = total;

  total -= discount;

  // 🔥 UPDATE USAGE (สำคัญ)
  coupon.usedCount += 1;

  if (
    userId &&
    !coupon.claimedBy.some(
      (id) => id.toString() === userId.toString()
    )
  ) {
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
// ✅ CREATE ORDER (V2)
// ==========================
export const createOrder = async (req, res) => {
  try {
    let { foods, user, paymentMethod, coupon } = req.body;

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
    // 💰 CALCULATE PRICE (กันโกง)
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
    // 🎟️ APPLY COUPON (ตรงนี้เท่านั้น)
    // ==========================
    let discount = 0;

    if (coupon) {
      const result = await applyCouponToOrder(
        coupon,
        user,
        totalPrice
      );

      totalPrice = result.total;
      discount = result.discount;
    }

    // ==========================
    // ⏱ ETA + RIDER
    // ==========================
    const eta = Math.floor(10 + Math.random() * 10);

    const riderLocation = {
      lat: 14.073,
      lng: 100.608,
    };

    const slip = req.file ? req.file.filename : null;

    const order = await Order.create({
      user,
      foods: cleanFoods,
      totalPrice,
      discount, // 🔥 เพิ่ม field
      paymentMethod: normalizePaymentMethod(paymentMethod),
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
    res.status(400).json({
      message: error.message || "Create order failed",
    });
  }
};