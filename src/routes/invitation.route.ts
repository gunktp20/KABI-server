import express from "express";
import auth from "../middlewares/auth";
import {
  acceptInvitation,
  declineInvitation,
  readInvitations,
} from "../controllers/่invitation.controller";
const router = express.Router();

router.route("/accept").put(auth, acceptInvitation);
router.route("/decline").put(auth, declineInvitation);
router.route("/").put(auth, readInvitations);

export default router;
