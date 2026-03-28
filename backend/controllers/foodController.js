import Food from "../models/Food.js";
import mongoose from "mongoose";

// =========================
// 🔥 helper
// =========================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// =========================
// ✅ GET all foods (filter + search + category)
// =========================
export const getFoods = async (req, res) => {
  try {
    const { category, restaurant, search } = req.query;

    let filter = req.filter || {};

    // 🔥 search ชื่อ
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const foods = await Food.find(filter)
      .populate("restaurant")
      .sort({ createdAt: -1 });

    return res.json(foods);
  } catch (error) {
    console.error("GET FOODS ERROR 💥:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ✅ GET by ID
// =========================
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const food = await Food.findById(id).populate("restaurant").lean();

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    return res.json(food);
  } catch (error) {
    console.error("GET FOOD BY ID ERROR 💥:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ✅ CREATE
// =========================
export const createFood = async (req, res) => {
  try {
    let { name, price, image, description, category, restaurant } = req.body;

    name = name?.trim();

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    // 🔥 price
    price = Number(price);
    if (isNaN(price)) {
      return res.status(400).json({ message: "Price must be number" });
    }

    // 🔥 category default
    if (!category) {
      category = "อาหารจานเดียว";
    }

    // 🔥 validate restaurant
    if (restaurant && !isValidId(restaurant)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // 🔥 upload file มาก่อน
    if (req.file) {
      image = req.file.filename;
    }

    const food = await Food.create({
      name,
      price,
      description: description || "",
      category,
      restaurant: restaurant || null,
      image: image || null,
    });

    return res.status(201).json(food);
  } catch (error) {
    console.error("CREATE FOOD ERROR 💥:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ✅ UPDATE
// =========================
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = {};

    // 🔥 name
    if (req.body.name) {
      updateData.name = req.body.name.trim();
    }

    // 🔥 price
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (isNaN(price)) {
        return res.status(400).json({ message: "Price must be number" });
      }

      updateData.price = price;
    }

    // 🔥 description
    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }

    // 🔥 category
    if (req.body.category) {
      updateData.category = req.body.category;
    }

    // 🔥 restaurant
    if (req.body.restaurant) {
      if (!isValidId(req.body.restaurant)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      updateData.restaurant = req.body.restaurant;
    }

    // 🔥 image (file มาก่อน)
    if (req.file) {
      updateData.image = req.file.filename;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const food = await Food.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("restaurant");

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    return res.json(food);
  } catch (error) {
    console.error("UPDATE FOOD ERROR 💥:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ✅ DELETE
// =========================
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    return res.json({ message: "Food deleted" });
  } catch (error) {
    console.error("DELETE FOOD ERROR 💥:", error);
    return res.status(500).json({ message: error.message });
  }
};