import express from "express";
import {
  addToCart,
  getCartByUser,
  updateCart,
  removeFromCart
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/", addToCart);          // เพิ่มอาหาร
router.get("/:userId", getCartByUser); // ดู cart ของ user
router.put("/:id", updateCart);       // แก้ quantity
router.delete("/:id", removeFromCart); // ลบสินค้า

export default router;