import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../controllers/authController.js";

console.log("forgotPassword:", forgotPassword)

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/test",(req,res)=>{
res.send("auth route working")
})

export default router;