import express from "express";
const router = express.Router();
import { getAllUsers } from "../controllers/user.controller";
import auth from "../middlewares/auth";

router.route("/").get(auth, getAllUsers);

export default router;
