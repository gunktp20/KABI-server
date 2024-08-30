import express from "express";
import auth from "../middlewares/auth";
import {
  assignToMember,
  createTask,
  deleteTaskById,
  getTasksByBoardId,
  updateTaskDescription,
  updateTasksOrder,
} from "../controllers/task.controller";
const router = express.Router();

router.route("/").post(auth, createTask);
router.route("/:task_id").delete(auth, deleteTaskById);
router.route("/:task_id").put(auth, updateTaskDescription);
router.route("/:board_id/board").get(auth, getTasksByBoardId);
router.route("/:board_id/board").put(auth, updateTasksOrder);
router.route("/:task_id/assign").put(auth, assignToMember);

export default router;
