import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class BadRequestError extends CustomAPIError {
    public statusCode;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
