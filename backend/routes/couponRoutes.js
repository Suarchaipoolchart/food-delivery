import express from "express";
import {
  getCoupons,
  getCouponByCode,
  createCoupon,
  applyCoupon,
  claimCoupon, // 🔥 เพิ่ม
} from "../controllers/couponController.js";

// 🔐 optional auth
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// =========================
// 🔥 APPLY COUPON (ต้องอยู่บน)
// =========================
router.post("/apply", protect, applyCoupon);

// =========================
// 🔥 CLAIM COUPON (เพิ่มใหม่)
// =========================
router.post("/claim/:id", protect, claimCoupon);

// =========================
// 🔥 GET ALL
// =========================
router.get("/", getCoupons);

// =========================
// 🔥 GET BY CODE (แก้ path กันชน)
// =========================
router.get("/code/:code", getCouponByCode);

// =========================
// 🔥 CREATE (admin only)
// =========================
router.post("/", protect, isAdmin, createCoupon);

// =========================
// 🔥 UPDATE COUPON (เพิ่มใหม่)
// =========================
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =========================
// 🔥 DELETE COUPON (เพิ่มใหม่)
// =========================
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;