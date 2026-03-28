import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);     // ⭐ ตัวนี้สำคัญ
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;