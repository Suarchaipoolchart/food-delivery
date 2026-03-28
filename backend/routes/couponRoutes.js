import express from "express";
import {
  getCoupons,
  getCouponByCode,
  createCoupon,
  applyCoupon
} from "../controllers/couponController.js";

// ✅ (ถ้ามี auth ค่อยเปิดใช้)
// import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// =========================
// 🔥 APPLY COUPON (ต้องอยู่บน)
// =========================
router.post("/apply", applyCoupon);

// =========================
// 🔥 GET ALL
// =========================
router.get("/", getCoupons);

// =========================
// 🔥 GET BY CODE
// =========================
router.get("/:code", getCouponByCode);

// =========================
// 🔥 CREATE (owner/admin)
// =========================
router.post(
  "/",
  // protect, isAdmin, // 🔥 เปิดใช้ถ้ามีระบบ role
  createCoupon
);

export default router;