import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Assignment from "../models/Assignment";

const readAssignments = async (req: Request, res: Response) => {
  await Assignment.update(
    { seen: true },
    {
      where: { assignee_id: req.user?.userId },
    }
  );
  res.status(StatusCodes.OK).json({ msg: "Assignment were rode" });
};

export { readAssignments };
