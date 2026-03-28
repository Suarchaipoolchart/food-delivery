import Cart from "../models/Cart.js";

// เพิ่มอาหารลง cart
export const addToCart = async (req, res) => {
  try {
    const cart = new Cart(req.body);
    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ดู cart ของ user
export const getCartByUser = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.params.userId }).populate("food");
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// แก้จำนวนอาหาร
export const updateCart = async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ลบอาหารออกจาก cart
export const removeFromCart = async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};