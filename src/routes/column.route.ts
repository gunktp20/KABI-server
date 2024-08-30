import express from "express";
import auth from "../middlewares/auth";
import {
  createColumn,
  updateColumnName,
  deleteColumn
} from "../controllers/column.controller";
const router = express.Router();

router.route("/").post(auth, createColumn);
router.route("/:column_id").put(auth, updateColumnName);
router.route("/:column_id").delete(auth, deleteColumn);

export default router;
