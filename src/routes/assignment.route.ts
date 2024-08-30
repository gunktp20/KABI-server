import express from "express";
import auth from "../middlewares/auth";
import { readAssignments } from "../controllers/assignment.controller";
const router = express.Router();

router.route("/").put(auth, readAssignments);

export default router;
