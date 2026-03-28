import Payment from "../models/Payment.js";

export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const saved = await payment.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("orderId");

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};