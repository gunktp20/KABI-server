import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class ForbiddenError extends CustomAPIError {
    public statusCode;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default ForbiddenError;
