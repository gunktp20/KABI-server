import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Board from "../models/Board";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import User from "../models/User";
import Column from "../models/Column";
import BoardMembers from "../models/Board_Members";
import "express-async-errors";
import Invitation from "../models/Invitation";
import { onlineUsers } from "../app";
import Task from "../models/Task";
import Assignment from "../models/Assignment";
import { Op } from "sequelize";

const createBoard = async (req: Request, res: Response) => {
  const { board_name, key, description, invitedMembers } = req.body;
  if (!board_name || !key || typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }

  try {
    const newBoard = await Board.create({
      board_name,
      key,
      description: description || null,
      owner_id: req.user?.userId,
    });

    const mergedInvitedMembers = await invitedMembers.map(
      (member: { id: string; displayName: string; email: string }) => {
        return {
          recipient_id: member?.id,
          sender_id: req?.user?.userId,
          board_id: newBoard.id,
        };
      }
    );

    await Invitation.bulkCreate(mergedInvitedMembers);

    await mergedInvitedMembers.map(
      async (member: {
        recipient_id: string;
        displayName: string;
        email: string;
      }) => {
        const recipientOnline = await onlineUsers.some(
          (user) => user.id === member.recipient_id
        );

        const userRecipient = onlineUsers.filter((user) => {
          return user.id === member.recipient_id;
        })[0];

        if (recipientOnline) {
          req.io.to(userRecipient.socketId).emit("InvitationCome", {
            content: `You received an invitation to join ${newBoard.board_name} board`,
          });
        }
      }
    );

    await BoardMembers.create({
      user_id: req.user?.userId,
      board_id: newBoard.id,
    });
    const columns = [
      {
        column_name: "TO DO",
        board_id: newBoard.id,
        sequence: 1,
      },
      {
        column_name: "IN PROGRESS",
        board_id: newBoard.id,
        sequence: 2,
      },
      {
        column_name: "DONE",
        board_id: newBoard.id,
        sequence: 3,
      },
    ];
    await Column.bulkCreate(columns);
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Created your board successfully" });
  } catch (err) {
    throw err;
  }
};

const getAllBoards = async (req: Request, res: Response) => {
  const { query } = req.query;
  const numOfPage: number = parseInt(req.query.numOfPage as string) || 1;
  const limit: number = parseInt(req.query.limit as string) || 5;

  const offset = (numOfPage - 1) * limit;

  try {
    const { count, rows } = await BoardMembers.findAndCountAll({
      where: { user_id: req.user?.userId },
      attributes: ["id"],
      include: [
        {
          model: User,
          attributes: ["email", "displayName"],
        },
        {
          model: Board,
          attributes: [["id", "board_id"], "board_name", "description", "key"],
          where: {
            board_name: {
              [Op.like]: `%${query ? query : ""}%`,
            },
          },
          include: [
            {
              model: User,
              attributes: ["email", "displayName"],
            },
          ],
        },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);

    return res
      .status(StatusCodes.OK)
      .json({ boards: rows, numOfPage, totalPages });
  } catch (err) {
    throw err;
  }
};

const getBoardById = async (req: Request, res: Response) => {
  const { board_id } = req.params;
  const isMemberInBoard = await BoardMembers.findOne({
    where: { user_id: req.user?.userId, board_id },
  });

  if (!isMemberInBoard) {
    throw new UnAuthenticatedError("Your are not a member in the board");
  }

  try {
    const board = await Board.findOne({
      where: { id: board_id },
      include: [
        {
          model: User,
          attributes: ["email", "displayName"],
        },
        {
          model: Column,
          attributes: ["id", "column_name", "sequence"],
          order: [["sequence", "ASC"]],
          separate: true,
        },
      ],
    });
    const members = await BoardMembers.findAll({
      where: { board_id },
      include: [
        {
          model: User,
          attributes: ["email", "displayName"],
        },
      ],
      raw: true,
    });
    const filteredMembers = await members.map((boardMember) => {
      return {
        user_id: boardMember.user_id,
        email: boardMember["user.email"],
        displayName: boardMember["user.displayName"],
      };
    });
    return res.status(StatusCodes.OK).json({ board, members: filteredMembers });
  } catch (err) {
    throw err;
  }
};

const updateBoardById = async (req: Request, res: Response) => {
  const { board_name, key, description } = req.body;
  const isBoardOwner = await Board.findOne({
    where: { id: req.params.board_id, owner_id: req.user?.userId },
  });

  if (!isBoardOwner) {
    throw new UnAuthenticatedError("Your are not a owner of the board");
  }

  await Board.update(
    {
      board_name,
      key,
      description,
    },
    { where: { id: req.params.board_id } }
  );
  res.status(StatusCodes.OK).json({ msg: "Updated your board" });
};

const deleteBoardById = async (req: Request, res: Response) => {
  const { board_id } = req.params;

  const isBoardOwner = await Board.findOne({
    where: { id: req.params.board_id, owner_id: req.user?.userId },
  });

  if (!isBoardOwner) {
    throw new UnAuthenticatedError("Your are not a owner of the board");
  }
  await Assignment.destroy({
    where: { board_id: board_id },
  });
  await Task.destroy({
    where: { board_id: board_id },
  });
  await Board.destroy({
    where: { id: board_id },
  });
  res.status(StatusCodes.OK).json({ msg: "Deleted your board" });
};

export {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoardById,
  deleteBoardById,
};
