const app = require("./app");
const http = require("http");
const { initializeSocket } = require("./socket");
const { initializeWebSocket } = require("./websocket");

const PORT = 8080;

const httpServer = http.createServer(app);

const io = initializeSocket(httpServer);
const wsServers = initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app };
