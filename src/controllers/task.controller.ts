import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors";
import Task from "../models/Task";
import Board from "../models/Board";
import User from "../models/User";
import "express-async-errors";
import BoardMembers from "../models/Board_Members";
import Assignment from "../models/Assignment";
import { onlineUsers } from "../app";

const createTask = async (req: Request, res: Response) => {
  const { description, board_id, column_id } = req.body;
  if (
    !description ||
    !column_id ||
    !board_id ||
    typeof req.user?.userId === "undefined"
  ) {
    throw new BadRequestError("Please provide all value");
  }

  const isBoardMember = await BoardMembers.findOne({
    where: { board_id, user_id: req.user.userId },
  });

  if (!isBoardMember) {
    throw new UnAuthenticatedError("you are not board member");
  }

  try {
    const newTask = await Task.create({
      description,
      board_id,
      column_id,
      assignee_id: req.user.userId,
    });
    const task = await Task.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: User,
          attributes: ["email", "displayName"],
        },
      ],
    });
    return res.status(StatusCodes.OK).json(task);
  } catch (err) {
    throw err;
  }
};

const getTasksByBoardId = async (req: Request, res: Response) => {
  const isBoardMember = await BoardMembers.findOne({
    where: { board_id: req.params.board_id, user_id: req.user?.userId },
  });

  if (!isBoardMember) {
    throw new UnAuthenticatedError("you are not board member");
  }

  try {
    const tasks = await Task.findAll({
      where: { board_id: req.params.board_id },
      include: [
        {
          model: User,
          attributes: ["email", "displayName"],
        },
      ],
      order: [["position", "ASC"]],
    });
    return res.status(StatusCodes.OK).json(tasks);
  } catch (err) {
    throw err;
  }
};

const updateTasksOrder = async (req: Request, res: Response) => {
  const { board_id } = req.params;
  const { tasks_order } = req.body;
  if (
    !board_id ||
    !tasks_order ||
    tasks_order.length <= 0 ||
    typeof req.user?.userId === "undefined"
  ) {
    throw new NotFoundError("Please provide all value");
  }
  const isBoardMember = await BoardMembers.findOne({
    where: { board_id: board_id, user_id: req.user.userId },
  });

  if (!isBoardMember) {
    throw new UnAuthenticatedError("you are not board member");
  }

  await req.body.tasks_order.map(
    async (
      task: { id: string; board_id: string; column_id: string },
      i: number
    ) => {
      if (task.board_id !== board_id) {
        throw new UnAuthenticatedError("tasks order is not valid");
      }
      await Task.update(
        { position: i + 1, column_id: task.column_id },
        {
          where: {
            id: task.id,
          },
        }
      );
    }
  );
  res.status(StatusCodes.OK).json({ msg: "updated tasks order" });
};

const updateTaskDescription = async (req: Request, res: Response) => {
  const { description } = req.body;
  const { task_id } = req.params;

  if (!description) {
    throw new BadRequestError("Please provide task description");
  }

  const task = await Task.findOne({
    where: { id: task_id },
    include: [{ model: Board, attributes: ["board_name"] }],
  });

  if (!task) {
    throw new NotFoundError("Not found task with id " + task_id);
  }

  const isBoardMember = await BoardMembers.findOne({
    where: { user_id: req.user?.userId, board_id: task.board_id },
  });

  if (!isBoardMember) {
    throw new UnAuthenticatedError("you are not board member");
  }

  task.description = description;
  await task.save();

  res.status(StatusCodes.OK).json({ msg: " updated your task description" });
};

const deleteTaskById = async (req: Request, res: Response) => {
  const { task_id } = req.params;
  if (!task_id || typeof req.user?.userId === "undefined") {
    throw new NotFoundError("Please provide all value");
  }
  const task = await Task.findOne({ where: { id: task_id } });
  if (!task) {
    throw new NotFoundError("Not found your task");
  }
  const isBoardMember = await BoardMembers.findOne({
    where: { board_id: task?.board_id, user_id: req.user.userId },
  });
  if (!isBoardMember) {
    throw new UnAuthenticatedError("you is not board member");
  }
  await Assignment.destroy({
    where: { task_id },
  });
  await Task.destroy({
    where: { id: task_id },
  });
  res.status(StatusCodes.OK).json({ msg: "Deleted your task" });
};

const assignToMember = async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { recipient_email } = req.body;

  if (!recipient_email || typeof req.user?.userId === "undefined") {
    throw new BadRequestError("Please provide all value");
  }

  const task = await Task.findOne({
    where: { id: task_id },
    include: [
      {
        model: Board,
        attributes:["board_name"]
      },
    ],
  });
  if (!task) {
    throw new NotFoundError("Not found your task");
  }
  const recipientUser = await User.findOne({
    where: { email: recipient_email },
  });

  if (task.assignee_id === recipientUser?.id) {
    return res.status(StatusCodes.OK).json({ msg: "task was assigned" });
  }

  if (!recipientUser) {
    throw new NotFoundError("Not found recipient user");
  }

  const isBoardMember = await BoardMembers.findOne({
    where: { user_id: req.user?.userId, board_id: task.board_id },
  });

  if (!isBoardMember) {
    throw new UnAuthenticatedError("you are not board member");
  }

  const isRecipientUserAMember = await BoardMembers.findOne({
    where: { user_id: recipientUser?.id, board_id: task.board_id },
  });

  if (!isRecipientUserAMember) {
    throw new UnAuthenticatedError("recipient user is not board member");
  }

  if (recipientUser?.id === task.assignee_id) {
    return res.status(StatusCodes.OK).json({ msg: "task was assigned" });
  }

  await Task.update(
    {
      assignee_id: recipientUser?.id,
    },
    {
      where: { id: task_id },
    }
  );

  if (recipientUser?.id === req.user.userId) {
    return res.status(StatusCodes.OK).json({ msg: "task was assigned" });
  }

  const oldAssignment = await Assignment.findOne({
    where: {
      assignee_id: recipientUser?.id,
      task_id: task_id,
    },
  });

  if (oldAssignment) {
    await oldAssignment.destroy();
  }

  await Assignment.create({
    assignee_id: recipientUser?.id,
    sender_id: req.user?.userId,
    task_id: task.id,
    board_id: task.board_id
  });

  const recipientOnline = await onlineUsers.some(
    (user) => user.id === recipientUser?.id
  );

  const userRecipient = onlineUsers.filter((user) => {
    return user.id === recipientUser?.id;
  })[0];

  if (recipientOnline) {
    req.io.to(userRecipient.socketId).emit("AssignmentCome", {
      content: `You have been assigned the task of ${task.description} `,
    });
  }

  res.status(StatusCodes.OK).json({ msg: "task was assigned" });
};

export {
  createTask,
  getTasksByBoardId,
  deleteTaskById,
  updateTasksOrder,
  updateTaskDescription,
  assignToMember,
};
