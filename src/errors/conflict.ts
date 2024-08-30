import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class ConflictError extends CustomAPIError {
    public statusCode;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export default ConflictError;
