import User from "../models/User.js";

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE user
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 🔐 LOGIN USER / ADMIN
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // ❌ ไม่เจอ user
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ❌ เช็ครหัส (กรณีมี method matchPassword)
    if (user.matchPassword) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
    } else {
      // ⚠️ fallback (plain text)
      if (user.password !== password) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
    }

    // ✅ ส่ง role กลับไป (สำคัญ)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================
// 📝 REGISTER (รองรับ role)
// ==========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user", // 🔥 default user
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ==========================
// 🔐 CHECK ADMIN (middleware)
// ==========================
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.headers["userid"]; // 🔥 simple way

    if (!userId) {
      return res.status(401).json({ message: "No user id" });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};