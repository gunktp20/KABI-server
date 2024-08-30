import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || "";
const SECRET_VERIFY_EMAIL = process.env.SECRET_VERIFY_EMAIL || "";
const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS || "";

const AUTH_EMAIL = process.env.AUTH_EMAIL || "";
const AUTH_PASS = process.env.AUTH_PASS || "";

const EXPIRES_IN_ACCESS_TOKEN = process.env.EXPIRES_IN_ACCESS_TOKEN || "";

const DATABASE_NAME = process.env.DATABASE_NAME || "";
const DATABASE_USER = process.env.DATABASE_USER || "";
const DATABASE_HOST = process.env.DATABASE_HOST || "";
const DATABASE_PORT = process.env.DATABASE_PORT || 3307;
const DATABASE_PASS = process.env.DATABASE_PASS || "";

export {
  PORT,
  CLIENT_URL,
  SECRET_VERIFY_EMAIL,
  JWT_SECRET_ACCESS,
  AUTH_EMAIL,
  AUTH_PASS,
  EXPIRES_IN_ACCESS_TOKEN,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASS,
  DATABASE_PORT,
  DATABASE_HOST,
};
