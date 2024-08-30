import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors";
import Invitation from "../models/Invitation";
import Board from "../models/Board";
import User from "../models/User";
import BoardMembers from "../models/Board_Members";
import "express-async-errors";
import { onlineUsers } from "../app";

const createBoardInvitation = async (req: Request, res: Response) => {
  const { recipient_id } = req.body;
  const { board_id } = req.params;
  if (!board_id || !recipient_id || typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }

  const isUserOwner = await Board.findOne({
    where: { id: board_id, owner_id: req?.user.userId },
  });

  if (!isUserOwner) {
    throw new UnAuthenticatedError("it's not your board");
  }

  const invitationWasSent = await Invitation.findOne({
    where: {
      recipient_id,
      board_id,
    },
  });

  const recipientUser = await User.findOne({
    where: { id: recipient_id },
  });

  if (invitationWasSent) {

    const recipientOnline = await onlineUsers.some(
      (user) => user.id === recipient_id
    );

    const userRecipient = onlineUsers.filter((user) => {
      return user.id === recipient_id;
    })[0];

    if (recipientOnline) {
      req.io.to(userRecipient.socketId).emit("InvitationCome",{ content:`You received an invitation to join ${isUserOwner.board_name} board by ${recipientUser?.displayName}`});
    }
  
    return res.status(StatusCodes.OK).json({
      msg: `Invited ${recipientUser?.displayName} to ${isUserOwner.board_name} board`,
    });
  }

  if (!recipientUser) {
    throw new NotFoundError("Not found recipient user");
  }

  try {
    await Invitation.create({
      recipient_id: recipientUser?.id,
      sender_id: req?.user?.userId,
      board_id,
    });

    const recipientOnline = await onlineUsers.some(
      (user) => user.id === recipient_id
    );

    const userRecipient = onlineUsers.filter((user) => {
      return user.id === recipient_id;
    })[0];

    if (recipientOnline) {
      req.io.to(userRecipient.socketId).emit("InvitationCome",{ content:`You received an invitation to join ${isUserOwner.board_name} board by ${recipientUser?.displayName}`});
    }

    return res.status(StatusCodes.OK).json({
      msg: `Invited ${recipientUser?.displayName} to ${isUserOwner.board_name} board`,
    });
  } catch (err) {
    throw err;
  }
};

const acceptInvitation = async (req: Request, res: Response) => {
  const { sender_id, board_id } = req.body;

  const invitation = await Invitation.findOne({
    where: {
      recipient_id: req.user?.userId,
      board_id,
      sender_id,
    },
  });

  if (!invitation) {
    throw new NotFoundError("Not found your invitation");
  }

  invitation.status = "accepted";

  await BoardMembers.create({ user_id: req.user?.userId, board_id });
  await invitation.save();

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

  res.status(StatusCodes.OK).json(invitations);
};

const declineInvitation = async (req: Request, res: Response) => {
  const { sender_id, board_id } = req.body;

  const invitation = await Invitation.findOne({
    where: {
      recipient_id: req.user?.userId,
      board_id,
      sender_id,
    },
  });

  if (!invitation) {
    throw new NotFoundError("Not found your invitation");
  }

  if (invitation.status === "accepted") {
    throw new BadRequestError("Invitation has already been accepted");
  }

  await invitation.destroy();
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

  res.status(StatusCodes.OK).json(invitations);
};

const readInvitations = async (req: Request, res: Response) => {
  await Invitation.update(
    { seen: true },
    {
      where: { recipient_id: req.user?.userId },
    }
  );
  res.status(StatusCodes.OK).json({ msg: "Invitations were rode" });
};

export {
  createBoardInvitation,
  acceptInvitation,
  declineInvitation,
  readInvitations,
};
