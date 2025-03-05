const app = require("./app");
const http = require("http");
const expressWs = require("express-ws");
const { initializeSocket } = require("./socket");
const { initializeWebSocket } = require("./websocket");

const PORT = 8080;
const httpServer = http.createServer(app);

expressWs(app, httpServer);

initializeWebSocket(app);

const io = initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app };
