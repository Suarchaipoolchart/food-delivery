import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // 🔥 CODE
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // auto เป็นตัวใหญ่
      trim: true,
    },

    // 🔥 ส่วนลด
    discount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔥 ประเภทส่วนลด
    type: {
      type: String,
      enum: ["percent", "fixed"], // %
      default: "fixed",
    },

    // 🔥 วันหมดอายุ
    expiresAt: {
      type: Date,
    },

    // 🔥 จำกัดการใช้ (optional)
    maxUses: {
      type: Number,
      default: 0, // 0 = ไม่จำกัด
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    // 🔥 คนที่ใช้ไปแล้ว
    claimedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔥 สถานะ
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// =========================
// 🔥 METHODS (เช็คใช้ได้ไหม)
// =========================
couponSchema.methods.isValidCoupon = function (userId) {
  // ❌ ปิดใช้งาน
  if (!this.isActive) return "Coupon not active";

  // ❌ หมดอายุ
  if (this.expiresAt && new Date() > this.expiresAt) {
    return "Coupon expired";
  }

  // ❌ ใช้ครบ limit
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) {
    return "Coupon fully used";
  }

  // ❌ user ใช้แล้ว
  if (
    userId &&
    this.claimedBy.some(
      (id) => id.toString() === userId.toString()
    )) {
    return "You already used this coupon";
  }

  return null; // ✅ ใช้ได้
};

export default mongoose.model("Coupon", couponSchema);