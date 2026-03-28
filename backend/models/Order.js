import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    foods: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        qty: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "transfer"],
      default: "cash",
    },

    slip: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "preparing", "on_the_way", "delivered"],
      default: "pending",
      index: true,
    },

    riderLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    eta: {
      type: Number,
      default: 0,
    },

    statusHistory: [
      {
        status: String,
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// ==========================
// 🔥 NORMALIZE
// ==========================
const normalizeStatus = (status) => {
  if (!status) return "pending";

  const s = status.toLowerCase();

  if (s.includes("received") || s.includes("pending")) return "pending";
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

// ==========================
// 🔥 PRE SAVE (NO next ❗)
// ==========================
orderSchema.pre("save", async function () {
  this.status = normalizeStatus(this.status);
  this.paymentStatus = normalizePayment(this.paymentStatus);

  if (!this.statusHistory) {
    this.statusHistory = [];
  }

  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      at: new Date(),
    });
  }
});

// ==========================
// 🔥 PRE UPDATE (NO next ❗)
// ==========================
orderSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() || {};

  const data = update.$set || update;

  if (data.status) {
    data.status = normalizeStatus(data.status);

    update.$push = update.$push || {};
    update.$push.statusHistory = {
      status: data.status,
      at: new Date(),
    };
  }

  if (data.paymentStatus) {
    data.paymentStatus = normalizePayment(data.paymentStatus);
  }

  this.setUpdate(update);
});

// ==========================
// 🔥 INDEX
// ==========================
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// ==========================
// 🔥 TRANSFORM
// ==========================
orderSchema.methods.toJSON = function () {
  const obj = this.toObject();

  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;

  return obj;
};

// ==========================
// 🔥 STATS
// ==========================
orderSchema.statics.getStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
};

export default mongoose.model("Order", orderSchema);