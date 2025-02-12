const app = require("./app");
const http = require("http");
const { initializeSocket } = require("./socket");
const PORT = 8080;

const httpServer = http.createServer(app);

const io = initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app };
