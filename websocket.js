const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const SECRET_KEY = "lrhtdjfkvreshgjvncuijcmnrg";
const connectedUsers = new Map();

async function handleWebSocketConnection(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(4001, "Authorization token not provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      ws.close(4004, "User not found");
      return;
    }

    ws.user = user;
    connectedUsers.set(user.id, ws);

    console.log(`User ${user.username} connected `);
    ws.send(`Welcome ${user.username}!`);

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { recipientId, content } = parsedMessage;

        if (!recipientId || !content) {
          ws.send(JSON.stringify({ error: "Invalid message format" }));
          return;
        }

        const recipientSocket = connectedUsers.get(recipientId);
        if (recipientSocket) {
          recipientSocket.send(
            JSON.stringify({
              sender: user.username,
              content,
            })
          );
        } else {
          ws.send(JSON.stringify({ error: "Recipient not online" }));
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    ws.on("close", () => {
      connectedUsers.delete(user.id);
      console.log(`User ${user.username} disconnected`);
    });
  } catch (error) {
    console.error("WebSocket authentication error:", error.message);
    ws.close(4003, "Authentication failed");
  }
}

function initializeWebSocket(app) {
  app.ws("/ws1", handleWebSocketConnection);
  app.ws("/ws2", handleWebSocketConnection);
}

function send(recipientId, message) {
  const recipientSocket = connectedUsers.get(recipientId);
  if (recipientSocket) {
    recipientSocket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

module.exports = { initializeWebSocket, send };
