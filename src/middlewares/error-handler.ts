import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err)
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg:
      (err.message.includes(":") ? err.message.split(":")[2] : err.message) ||
      "Something went wrong , try again later",
  };
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

export default errorHandlerMiddleware;
