import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================
// 🔥 PROTECT (เช็ค login)
// =========================
export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔥 รองรับทั้ง Bearer + fallback
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 🔥 verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 หา user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR 💥:", error.message);

    // 🔥 แยก error ให้ชัด
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Token invalid" });
  }
};

// =========================
// 🔥 ADMIN ONLY
// =========================
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};