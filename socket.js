const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { Unauthorized, NotFound, InternalServerError } = require("./errors");
const prisma = new PrismaClient();
const SECRET_KEY = "lrhtdjfkvreshgjvncuijcmnrg";

let io;
const connectedUsers = new Map();

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Unauthorized("Authorization token not provided"));
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, role: true },
      });

      if (!user) {
        return next(new NotFound("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Unauthorized("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(
      `User ${socket.user.username} connected with socket ${socket.id}`
    );

    try {
      const userConversations = await prisma.conversation.findMany({
        where: {
          conversationUsers: { some: { userId: socket.user.id } },
        },
      });

      userConversations.forEach((conversation) => {
        socket.join(conversation.id.toString());
        console.log(
          `User ${socket.user.username} joined conversation ${conversation.id}`
        );
      });

      connectedUsers.set(socket.id, {
        userId: socket.user.id,
        conversations: userConversations.map((conv) => conv.id),
      });
    } catch (error) {
      console.error("Error joining conversations:", error);
      socket.emit(
        "error",
        new InternalServerError("Failed to join conversations").toJson()
      );
    }

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      console.log(
        `User ${socket.user.username} disconnected (socket ${socket.id})`
      );
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new InternalServerError("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIo };
