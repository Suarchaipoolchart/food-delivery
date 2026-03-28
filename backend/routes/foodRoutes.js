import express from "express";
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// =========================
// 🔥 TOGGLE MODE (สำคัญมาก)
// =========================
// 👉 true = ปิด auth (DEV)
// 👉 false = เปิด auth (PROD)
const DEV_MODE = true;

// =========================
// 🔥 MIDDLEWARE HELPER
// =========================
const adminOnly = DEV_MODE ? [] : [protect, isAdmin];

// =========================
// 🔥 GET ALL (filter + search + category)
// =========================
router.get(
  "/",
  async (req, res, next) => {
    try {
      let { category, restaurant, search } = req.query;

      const filter = {};

      // 🔥 CATEGORY FIX
      if (category && category !== "all") {
  const map = {
    food: ["food", "อาหารจานเดียว"],
    drink: ["drink", "เครื่องดื่ม"],
    dessert: ["dessert", "ของหวาน"],
  };

  filter.category = { $in: map[category] || [category] };
}

      // 🔥 RESTAURANT
      if (restaurant) {
        filter.restaurant = restaurant;
      }

      // 🔥 SEARCH
      if (search) {
        filter.name = {
          $regex: search.trim(),
          $options: "i",
        };
      }

      req.filter = filter;

      next();
    } catch (err) {
      next(err);
    }
  },
  getFoods
);

// =========================
// 🔥 GET BY ID
// =========================
router.get("/:id", getFoodById);

// =========================
// 🔥 CREATE
// =========================
router.post(
  "/",
  ...adminOnly,
  upload.single("image"),
  (req, res, next) => {
    try {
      req.body.price = Number(req.body.price) || 0;

      if (req.body.category) {
        req.body.category = req.body.category.toLowerCase().trim();
      }

      next();
    } catch (err) {
      next(err);
    }
  },
  createFood
);

// =========================
// 🔥 UPDATE
// =========================
router.put(
  "/:id",
  ...adminOnly,
  upload.single("image"),
  (req, res, next) => {
    try {
      if (req.body.price !== undefined) {
        req.body.price = Number(req.body.price) || 0;
      }

      if (req.body.category) {
        req.body.category = req.body.category.toLowerCase().trim();
      }

      next();
    } catch (err) {
      next(err);
    }
  },
  updateFood
);

// =========================
// 🔥 DELETE
// =========================
router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      if (!DEV_MODE) {
        console.log("USER:", req.user); // debug เฉพาะตอนเปิด auth
      }

      next();
    } catch (err) {
      next(err);
    }
  },
  deleteFood
);

export default router;