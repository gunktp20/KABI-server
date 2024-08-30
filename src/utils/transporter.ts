import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { AUTH_EMAIL, AUTH_PASS } from "../config/application.config";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASS,
  },
});

export default transporter;
