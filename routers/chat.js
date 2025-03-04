const express = require("express");
const authenticate = require("../middlewares/authenticate");
// const {
//   sendMessage,
//   getMessages,
//   getConversations,
//   createGroup,
//   joinGroup,
// } = require("../services/chatService");
const { send } = require("../websocket");

const router = express.Router();

// router.post("/message", authenticate, send);
// router.get("/:conversationId/messages", authenticate, getMessages);
// router.get("/", authenticate, getConversations);
// router.post("/group", authenticate, createGroup);
// router.post("/group/join", authenticate, joinGroup);

router.post("/send", (req, res) => {
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    return res
      .status(400)
      .json({ error: "recipientId and content are required" });
  }

  const messagePayload = {
    sender: "Server",
    content,
  };

  const sent = send(recipientId, messagePayload);
  if (sent) {
    res.json({ message: "Message sent successfully" });
  } else {
    res.status(404).json({ error: "Recipient not online" });
  }
});

module.exports = router;
