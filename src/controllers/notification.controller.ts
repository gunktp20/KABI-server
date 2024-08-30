import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Invitation from "../models/Invitation";
import { BadRequestError } from "../errors";
import User from "../models/User";
import Board from "../models/Board";
import Task from "../models/Task";
import Assignment from "../models/Assignment";

const getAllNotifications = async (req: Request, res: Response) => {
  if (typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }

  const invitations = await Invitation.findAll({
    where: {
      recipient_id: req.user?.userId,
    },
    attributes: ["id", "status", "createdAt"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "recipient",
        attributes: [["id", "user_id"], "email", "displayName"],
      },
      {
        model: User,
        as: "sender",
        attributes: [["id", "user_id"], "email", "displayName"],
      },
      {
        model: Board,
        attributes: [["id", "board_id"], "board_name", "description", "key"],
      },
    ],
  });
  const unreadInvitations = await Invitation.findAll({
    where: {
      seen: false,
      recipient_id: req.user?.userId,
    },
  });

  const assignments = await Assignment.findAll({
    where: {
      assignee_id: req?.user.userId,
    },
    attributes: ["id", "createdAt"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "assignee",
        attributes: [["id", "user_id"], "email", "displayName"],
      },
      {
        model: User,
        as: "sender",
        attributes: [["id", "user_id"], "email", "displayName"],
      },
      {
        model: Task,
        attributes: ["description", "board_id"],
        include:[{
            model:Board,
            attributes:["board_name"]
        }],
      },
    ],
  });

  const unreadAssignments = await Assignment.findAll({
    where: {
      seen: false,
      assignee_id: req.user?.userId,
    },
  });

  res.status(StatusCodes.OK).json({
    invitations,
    assignments,
    unreadInvitations: unreadInvitations.length,
    unreadAssignments: unreadAssignments.length,
    unreadNotifications: unreadInvitations.length + unreadAssignments.length,
  });
};

export { getAllNotifications };
