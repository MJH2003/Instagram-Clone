const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  sendMessage,
  getMessages,
  getConversations,
  createGroup,
  joinGroup,
} = require("../services/chatService");

const router = express.Router();

router.post("/message", authenticate, sendMessage);
router.get("/:conversationId/messages", authenticate, getMessages);
router.get("/", authenticate, getConversations);
router.post("/group", authenticate, createGroup);
router.post("/group/join", authenticate, joinGroup);

module.exports = router;
