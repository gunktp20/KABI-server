import express from "express";
import {
  register,
  login,
  verifyEmailWithToken,
} from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";
const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message:
    "Too many accounts created request, please try again after 1 minutes",
});

router.route("/register").post(registerLimiter,register);
router.route("/login").post(login);
router.route("/email/").put(verifyEmailWithToken);

export default router;
