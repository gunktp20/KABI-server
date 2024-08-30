import express from "express";
import {
  createBoard,
  deleteBoardById,
  getAllBoards,
  getBoardById,
  updateBoardById,
} from "../controllers/board.controller";
import auth from "../middlewares/auth";
import { createBoardInvitation } from "../controllers/่invitation.controller";
const router = express.Router();

router.route("/").post(auth, createBoard);
router.route("/").get(auth, getAllBoards);
router.route("/:board_id").get(auth, getBoardById);
router.route("/:board_id").put(auth, updateBoardById);
router.route("/:board_id").delete(auth, deleteBoardById);

router.route("/:board_id/invite").post(auth, createBoardInvitation);
export default router;
