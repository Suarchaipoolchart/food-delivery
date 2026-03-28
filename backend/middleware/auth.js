import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================
// 🔥 PROTECT (เช็ค login)
// =========================
export const protect = async (req, res, next) => {
  try {
    let token;

    // รับ token จาก header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดึง user จาก DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR 💥:", error.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};

// =========================
// 🔥 ADMIN ONLY
// =========================
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Admin check error" });
  }
};