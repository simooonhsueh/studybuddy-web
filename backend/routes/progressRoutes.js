import { Router } from "express";
import {
  checkIn,
  completeTask,
  getProgress,
  replaceTasks,
} from "../controllers/progressController.js";

const router = Router();

router.get("/progress", getProgress);
router.put("/progress/tasks", replaceTasks);
router.patch("/tasks/:id/complete", completeTask);
router.post("/checkin", checkIn);

export default router;
