import express from "express";
import { suggestSchedule } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/suggest-schedule", suggestSchedule);

export default router;