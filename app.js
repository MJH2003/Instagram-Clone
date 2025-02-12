const { PrismaClient } = require("@prisma/client");
const {
  HttpError,
  NotFound,
  Unauthorized,
  InternalServerError,
  BadRequest,
} = require("./errors");
const routers = require("./routers");
const express = require("express");
require("express-async-errors");
const path = require("path");
const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routers

app.use("/api", routers);

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json(err.toJson());
  } else {
    console.error(err);
    const internalError = new InternalServerError("Something went wrong");
    res.status(internalError.status).json(internalError.toJson());
  }
});

module.exports = app;
