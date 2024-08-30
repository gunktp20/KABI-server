import express from "express";
import auth from "../middlewares/auth";
import { getAllNotifications } from "../controllers/notification.controller";
const router = express.Router();

router.route("/").get(auth, getAllNotifications);
export default router;
