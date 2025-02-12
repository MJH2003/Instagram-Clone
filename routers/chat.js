const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  sendMessage,
  getMessages,
  getConversations,
} = require("../services/chatService");

const router = express.Router();

router.post("/message", authenticate, sendMessage);
router.get("/:conversationId/messages", authenticate, getMessages);
router.get("/", authenticate, getConversations);

module.exports = router;
