import Coupon from "../models/Coupon.js";

// ==============================
// 🔥 HELPER (กัน ObjectId พัง)
// ==============================
const isUsedByUser = (coupon, userId) => {
  if (!userId) return false;

  return coupon.claimedBy.some(
    (id) => id.toString() === userId.toString()
  );
};

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
    const { code, discount, type, expiresAt, maxUses } = req.body;

    if (!code || !discount) {
      return res.status(400).json({
        message: "Code and discount required",
      });
    }

    const exist = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (exist) {
      return res.status(400).json({
        message: "Coupon already exists",
      });
    }

    const coupon = await Coupon.create({
      code,
      discount,
      type,
      expiresAt,
      maxUses,
    });

    res.status(201).json(coupon);
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

    // ❌ ใช้ซ้ำ
    if (isUsedByUser(coupon, req.user?._id)) {
      return res.status(400).json({
        message: "Coupon already claimed",
      });
    }

    // 🔥 add user
    if (req.user) {
      coupon.claimedBy.push(req.user._id);
      await coupon.save();
    }

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

    if (!total || total <= 0) {
      return res.status(400).json({
        message: "Invalid total",
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

    // =========================
    // 🔒 VALIDATION
    // =========================
    if (!coupon.isActive) {
      return res.status(400).json({
        message: "Coupon not active",
      });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({
        message: "Coupon expired",
      });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        message: "Coupon fully used",
      });
    }

    if (isUsedByUser(coupon, req.user?._id)) {
      return res.status(400).json({
        message: "You already used this coupon",
      });
    }

    // =========================
    // 💰 CALCULATE
    // =========================
    let discountAmount = 0;

    if (coupon.type === "percent") {
      discountAmount = (total * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    if (discountAmount > total) {
      discountAmount = total;
    }

    const finalTotal = total - discountAmount;

    // ❗ ไม่ update usage ที่นี่ (กันโกง)

    res.json({
      code: coupon.code,
      discount: discountAmount,
      finalTotal,
      couponId: coupon._id,
    });

  } catch (error) {
    console.log("APPLY COUPON ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};