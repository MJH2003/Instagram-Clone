const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./users");
const postRouter = require("./posts");
const commentRouter = require("./comments");
const chatRouter = require("./chat");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/chat", chatRouter);

module.exports = router;
