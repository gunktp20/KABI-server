import { UnAuthenticatedError } from "../errors/index";
import jwt, {
  JwtPayload,
} from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import {
  JWT_SECRET_ACCESS,
} from "../config/application.config";
import ForbiddenError from "../errors/forbidden";
interface IJwtPayload extends JwtPayload {
  userId: string;
  phoneNumber: string;
  email: string;
}
const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
  const token = authHeader.split(" ")[1];

  try {
    const { userId, email } = (await jwt.verify(
      token,
      JWT_SECRET_ACCESS
    )) as IJwtPayload;
    req.user = { userId, email };
    next();
  } catch (err) {
    throw new ForbiddenError("Token is not valid");
  }
};

export default auth;
