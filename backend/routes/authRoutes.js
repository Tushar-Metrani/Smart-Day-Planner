import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

export default router;