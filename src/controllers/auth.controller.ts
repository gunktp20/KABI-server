import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import schedule from "node-schedule";
import {
  BadRequestError,
  UnAuthenticatedError,
  ConflictError,
  ForBiddenError,
} from "../errors";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import {
  SECRET_VERIFY_EMAIL,
  CLIENT_URL,
  JWT_SECRET_ACCESS,
  EXPIRES_IN_ACCESS_TOKEN,
  AUTH_EMAIL,
} from "../config/application.config";
import { FORM_VERIFY_EMAIL } from "../utils/emailVerification";
import transporter from "../utils/transporter";
import User from "../models/User";
import "express-async-errors";
import bcrypt from "bcrypt";
import Invitation from "../models/Invitation";
import dotenv from "dotenv";
dotenv.config();
interface IJwtPayload extends JwtPayload {
  email: string;
}

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new BadRequestError("Please provide all value");
  }

  const user = await User.findOne({ where: { email } });

  if (user?.verified === true) {
    throw new ConflictError("E-mail was taken");
  }

  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  const date = new Date();
  const expiredIn = date.setMinutes(date.getMinutes() + 15);

  if (user?.verified === false) {
    const token = await jwt.sign({ email }, SECRET_VERIFY_EMAIL, {
      expiresIn: "15m",
    });

    await transporter.sendMail({
      from: AUTH_EMAIL,
      to: email,
      html: FORM_VERIFY_EMAIL(token, CLIENT_URL),
    });

    const countDeleteUser = schedule.scheduleJob(expiredIn, async () => {
      const user = await User.findOne({ where: { email } });
      if (user?.verified === false) {
        await User.destroy({ where: { email } });
      }
      countDeleteUser.cancel();
    });

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Resend your verification in your e-mail" });
  }

  const token = await jwt.sign({ email }, SECRET_VERIFY_EMAIL, {
    expiresIn: "15m",
  });

  await User.create({
    email,
    password: encodedPassword,
    displayName: email.split("@")[0],
  });

  await transporter.sendMail({
    from: AUTH_EMAIL,
    to: email,
    html: FORM_VERIFY_EMAIL(token, CLIENT_URL),
  });

  const countDeleteUser = schedule.scheduleJob(expiredIn, async () => {
    const user = await User.findOne({ where: { email } });
    if (user?.verified === false) {
      await User.destroy({ where: { email } });
    }
    countDeleteUser.cancel();
  });

  return res.status(StatusCodes.OK).json({
    msg: "Created your account , Please verify your email in 15 minutes",
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new UnAuthenticatedError("E-mail or password is incorrect");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user?.password || ""
  );

  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError("E-mail or password is incorrect");
  }

  if (!user.verified) {
    throw new UnAuthenticatedError("Please verify your e-mail before");
  }

  const accessToken = await jwt.sign(
    {
      userId: user.id,
      email,
    },
    JWT_SECRET_ACCESS,
    {
      expiresIn: EXPIRES_IN_ACCESS_TOKEN,
    }
  );

  const notifications = await Invitation.findAll({
    where: {
      recipient_id: user.id,
    },
  });

  res.status(StatusCodes.OK).json({
    accessToken,
    user: {
      userId: user.id,
      email,
      displayName: user?.displayName,
    },
    notifications,
  });
};

const verifyEmailWithToken = async (req: Request, res: Response) => {
  const token = req.body.token;
  if (!token) {
    throw new BadRequestError("Please provide a token");
  }

  try {
    const { email } = (await jwt.verify(
      token,
      SECRET_VERIFY_EMAIL
    )) as IJwtPayload;

    const user = await User.findOne({ where: { email } });
    if (user?.verified === true) {
      throw new BadRequestError("The account was verified");
    }

    await User.update(
      { verified: true },
      {
        where: { email },
      }
    );
    return res.status(StatusCodes.OK).json({
      msg: `your account was verified`,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new ForBiddenError("Token expired");
    }
    if (err instanceof JsonWebTokenError) {
      throw new UnAuthenticatedError("Token is invalid");
    }
    throw err;
  }
};

const verifyAccessToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    await jwt.verify(accessToken, JWT_SECRET_ACCESS);
  } catch (err) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
};

export { register, login, verifyEmailWithToken, verifyAccessToken };
