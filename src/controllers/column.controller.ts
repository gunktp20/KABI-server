import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Column from "../models/Column";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors";
import BoardMembers from "../models/Board_Members";
import "express-async-errors";

const createColumn = async (req: Request, res: Response) => {
  const { column_name, board_id } = req.body;
  if (!column_name || !board_id || typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }

  const isMemberInBoard = await BoardMembers.findOne({
    where: { user_id: req.user?.userId, board_id },
  });

  if (!isMemberInBoard) {
    throw new UnAuthenticatedError("Your are not a member in the board");
  }

  try {
    const column = await Column.create({
      column_name,
      board_id,
    });
    return res.status(StatusCodes.OK).json(column);
  } catch (err) {
    throw err;
  }
};

const updateColumnName = async (req: Request, res: Response) => {
  const { column_id, column_name } = req.body;
  if (!column_id || !column_name || typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }
  const column = await Column.findOne({ where: { id: column_id } });
  if (!column) {
    throw new NotFoundError("Not found your column id");
  }

  const isMemberInBoard = await BoardMembers.findOne({
    where: { user_id: req.user?.userId, board_id: column.board_id },
  });

  if (!isMemberInBoard) {
    throw new UnAuthenticatedError("Your are not a member in the board");
  }

  try {
    const column = await Column.update(
      { column_name },
      {
        where: { id: column_id },
      }
    );
    return res.status(StatusCodes.OK).json(column);
  } catch (err) {
    throw err;
  }
};

const deleteColumn = async (req: Request, res: Response) => {
  const { column_id } = req.params;
  if (!column_id || typeof req.user?.userId === "undefined") {
    throw new NotFoundError("Please provide all value");
  }
  const column = await Column.findOne({ where: { id: column_id } });
  if (!column) {
    throw new NotFoundError("Not found your task");
  }
  const isBoardMember = await BoardMembers.findOne({
    where: { board_id: column?.board_id, user_id: req.user.userId },
  });
  if (!isBoardMember) {
    throw new UnAuthenticatedError("you is not board member");
  }

  await Column.destroy({
    where: { id: column_id },
  });
  res.status(StatusCodes.OK).json({ msg: "Deleted your column" });
};

export { createColumn, updateColumnName, deleteColumn };
