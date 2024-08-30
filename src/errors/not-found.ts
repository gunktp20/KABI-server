import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class NotFoundError extends CustomAPIError {
  public statusCode;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export default NotFoundError;
