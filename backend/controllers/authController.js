import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// ======================
// 🔥 GENERATE TOKEN
// ======================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ======================
// ✅ REGISTER
// ======================
export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name?.trim();
    email = email?.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password >= 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user", // 🔥 default
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 🔥 ส่ง role ไป frontend
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR 💥:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// ✅ LOGIN
// ======================
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 🔥 สำคัญสำหรับ admin
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR 💥:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// ✅ GET PROFILE (ใช้กับ protect)
// ======================
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🔥 FORGOT PASSWORD
// ======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `
        <h3>Reset Password</h3>
        <p>Click link below:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>หมดอายุใน 10 นาที</p>
      `
    );

    res.json({ message: "Email sent" });

  } catch (err) {
    console.error("FORGOT ERROR 💥:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🔥 RESET PASSWORD
// ======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password >= 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalid or expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR 💥:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};