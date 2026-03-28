import Coupon from "../models/Coupon.js";

// ==============================
// 🔥 GET ALL COUPONS
// ==============================
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🔥 GET COUPON BY CODE
// ==============================
export const getCouponByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🔥 CREATE COUPON (OWNER/ADMIN)
// ==============================
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount,
      type,
      expiresAt,
      maxUses
    } = req.body;

    const exist = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (exist) {
      return res.status(400).json({
        message: "Coupon already exists",
      });
    }

    const coupon = new Coupon({
      code,
      discount,
      type,
      expiresAt,
      maxUses,
    });

    const saved = await coupon.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==============================
// 🔥 CLAIM COUPON (ลูกค้ากดรับ)
// ==============================
export const claimCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    // ❌ ใช้แล้ว
    if (coupon.claimedBy?.includes(req.user._id)) {
      return res.status(400).json({
        message: "Coupon already claimed",
      });
    }

    // ❌ หมดอายุ
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({
        message: "Coupon expired",
      });
    }

    coupon.claimedBy.push(req.user._id);
    await coupon.save();

    res.json({
      message: "Coupon claimed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🔥 APPLY COUPON (CHECKOUT)
// ==============================
export const applyCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Coupon code required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon",
      });
    }

    // ❌ ปิดใช้งาน
    if (!coupon.isActive) {
      return res.status(400).json({
        message: "Coupon not active",
      });
    }

    // ❌ หมดอายุ
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({
        message: "Coupon expired",
      });
    }

    // ❌ ใช้ครบ
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        message: "Coupon fully used",
      });
    }

    // ❌ ใช้ซ้ำ (ถ้ามี login)
    if (req.user && coupon.claimedBy.includes(req.user._id)) {
      return res.status(400).json({
        message: "You already used this coupon",
      });
    }

    // =========================
    // 💰 คำนวณส่วนลด
    // =========================
    let discountAmount = 0;

    if (coupon.type === "percent") {
      discountAmount = (total * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    // กันติดลบ
    if (discountAmount > total) {
      discountAmount = total;
    }

    const finalTotal = total - discountAmount;

    // =========================
    // 🔥 update usage
    // =========================
    coupon.usedCount += 1;

    if (req.user) {
      coupon.claimedBy.push(req.user._id);
    }

    await coupon.save();

    res.json({
      code: coupon.code,
      discount: discountAmount,
      finalTotal,
    });

  } catch (error) {
    console.log("APPLY COUPON ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};