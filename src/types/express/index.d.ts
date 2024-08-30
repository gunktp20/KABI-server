import { Request } from "express";
import mongoose from "mongoose";
import { SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    interface User {
      userId: string;
      email?: string;
      role?: "user" | "admin";
      phoneNumber?: string;
    }

    interface Request {
      user: User;
      io: SocketIOServer;
    }
  }
}
