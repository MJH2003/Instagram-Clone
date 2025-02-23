// websocket.js
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { Unauthorized, NotFound, InternalServerError } = require("./errors");

const prisma = new PrismaClient();
const SECRET_KEY = "lrhtdjfkvreshgjvncuijcmnrg";

// Create a new WebSocket server on port 8081
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", async (ws, req) => {
  // Extract the token from the query parameters (e.g., ws://localhost:8081/?token=YOUR_TOKEN)
  const params = new URLSearchParams(req.url.replace(/^\/\?/, ""));
  const token = params.get("token");
  if (!token) {
    ws.close(4001, "Authorization token not provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      ws.close(4004, "User not found");
      return;
    }

    // Attach user info to the WebSocket connection
    ws.user = user;
    console.log(`User ${user.username} connected via WebSocket`);

    // Emit a welcome message to the client when they connect
    ws.send(`Welcome ${user.username}! You are connected via WebSocket`);
  } catch (error) {
    console.error("WebSocket authentication error:", error.message);
    ws.close(4003, "Authentication failed");
  }
});

console.log("WebSocket server is running on ws://localhost:8081");
