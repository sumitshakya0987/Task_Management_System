import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, toggleTaskStatus } from "../controllers/tasksController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticateToken);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/toggle", toggleTaskStatus);

export default router;
