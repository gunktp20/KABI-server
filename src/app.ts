import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import notFoundMiddleware from "./middlewares/not-found";
import errorHandlerMiddleware from "./middlewares/error-handler";
import authRouter from "./routes/auth.route";
import boardRouter from "./routes/board.route";
import columnRouter from "./routes/column.route";
import taskRouter from "./routes/task.route";
import userRouter from "./routes/user.route";
import invitationRouter from "./routes/invitation.route";
import assignmentRouter from "./routes/assignment.route";
import notificationRouter from "./routes/notification.route";
import dotenv from "dotenv";
import "express-async-errors";
import cookieParser from "cookie-parser";
import http from "http";
import sequelize from "./db/connection";
import { Server as SocketIOServer } from "socket.io";
import { CLIENT_URL } from "./config/application.config";

export let onlineUsers: {
  id: string;
  email: string;
  displayName?: string;
  socketId: string;
}[] = [];

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

const attachSocketIO = (io: SocketIOServer) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.io = io;
    next();
  };
};

app.use(attachSocketIO(io));

app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`path ${req.originalUrl} | method ${req.method}`);
  next();
};

app.use(logger);

io.on("connection", (socket) => {
  socket.on("addNewUser", (newUser: { id: string; email: string }) => {
    !onlineUsers.some((user) => user.id === newUser.id) &&
      onlineUsers.push({
        id: newUser.id,
        email: newUser.email,
        socketId: socket.id,
      });
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => {
      return user.socketId !== socket.id;
    });
  });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/column", columnRouter);
app.use("/task", taskRouter);
app.use("/invitation", invitationRouter);
app.use("/assignment", assignmentRouter);
app.use("/notification", notificationRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await sequelize.sync({
      alter: true,
    });
    server.listen(PORT, () => {
      console.log(`server is running on port : ${PORT}`);
    });
  } catch (err) {
    console.log("err", err);
  }
};

start();
