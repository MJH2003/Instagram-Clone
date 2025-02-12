const { PrismaClient } = require("@prisma/client");
const { NotFound, BadRequest, InternalServerError } = require("../errors");
const { getIo } = require("../socket");
const prisma = new PrismaClient();

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return next(new BadRequest("You cannot send messages to yourself."));
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { id: senderId } } },
          { users: { some: { id: recipientId } } },
        ],
      },
      include: { users: true },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          users: { connect: [{ id: senderId }, { id: recipientId }] },
        },
        include: { users: true },
      });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: conversation.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    const io = getIo();
    io.to(conversation.id.toString()).emit("receiveMessage", {
      ...message,
      conversation: {
        id: conversation.id,
        users: conversation.users,
      },
    });

    res.status(201).json({
      message,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { users: true },
    });

    if (!conversation) return next(new NotFound("Conversation Not Found"));

    const isParticipant = conversation.users.some((user) => user.id === userId);
    if (!isParticipant) {
      return next(
        new BadRequest("You are not a participant in this conversation.")
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      messages,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: { some: { id: userId } },
      },
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(conversations);
  } catch (error) {
    throw new InternalServerError("Failed to fetch conversations");
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
};
