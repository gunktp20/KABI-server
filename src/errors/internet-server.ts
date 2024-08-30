import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class InternetServerError extends CustomAPIError {
  public statusCode;
  constructor() {
    super("Have an error on a server");
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export default InternetServerError;
