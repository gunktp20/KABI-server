import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/User";
import "express-async-errors";
import { Op } from "sequelize";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: req.user?.userId,
        },
      },
      attributes: ["id", "displayName", "email"],
    });
    return res.status(StatusCodes.OK).json(users);
  } catch (err) {
    throw err;
  }
};

export { getAllUsers };
