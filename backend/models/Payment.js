import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  method: {
    type: String,
    enum: ["cash", "credit_card", "promptpay"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "paid"
  }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);