const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { NotFound, BadRequest, InternalServerError } = require("../errors");
const { getIo } = require("../socket");
const prisma = new PrismaClient();

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user.id;

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(conversationId, 10) },
        include: { conversationUsers: { include: { user: true } } },
      });

      if (!conversation) {
        return next(new NotFound("Conversation not found"));
      }

      const isParticipant = conversation.conversationUsers.some(
        (cu) => cu.user.id === senderId
      );
      if (!isParticipant) {
        return next(
          new BadRequest("You are not a participant in this conversation")
        );
      }
    } else if (recipientId) {
      if (senderId === parseInt(recipientId, 10)) {
        return next(new BadRequest("You cannot send messages to yourself."));
      }

      conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { conversationUsers: { some: { userId: senderId } } },
            {
              conversationUsers: {
                some: { userId: parseInt(recipientId, 10) },
              },
            },
            { isGroup: false },
          ],
        },
        include: { conversationUsers: { include: { user: true } } },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            isGroup: false,
            conversationUsers: {
              create: [
                { user: { connect: { id: senderId } } },
                { user: { connect: { id: parseInt(recipientId, 10) } } },
              ],
            },
          },
          include: { conversationUsers: { include: { user: true } } },
        });
      }
    } else {
      return next(
        new BadRequest("Either recipientId or conversationId must be provided")
      );
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
    const participants = conversation.conversationUsers.map((cu) => cu.user);

    io.to(conversation.id.toString()).emit("receiveMessage", {
      ...message,
      conversation: {
        id: conversation.id,
        name: conversation.name,
        isGroup: conversation.isGroup,
        users: participants,
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
      include: { conversationUsers: { include: { user: true } } },
    });

    if (!conversation) return next(new NotFound("Conversation Not Found"));

    const isParticipant = conversation.conversationUsers.some(
      (cu) => cu.user.id === userId
    );
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

const getConversations = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        conversationUsers: { some: { userId } },
      },
      include: {
        conversationUsers: { include: { user: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, username: true, role: true },
            },
          },
        },
      },
    });

    res.status(200).json(conversations);
  } catch (error) {
    next(new InternalServerError("Failed to fetch conversations"));
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const creatorId = req.user.id;

    const joinCode = crypto.randomBytes(4).toString("hex");

    const group = await prisma.conversation.create({
      data: {
        name,
        isGroup: true,
        joinCode,
        conversationUsers: {
          create: [{ user: { connect: { id: creatorId } } }],
        },
      },
      include: { conversationUsers: { include: { user: true } } },
    });

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { joinCode },
      include: { conversationUsers: true },
    });

    if (!conversation) {
      return next(new NotFound("Group not found"));
    }

    const alreadyJoined = conversation.conversationUsers.some(
      (cu) => cu.userId === userId
    );
    if (alreadyJoined) {
      return next(new BadRequest("You have already joined this group"));
    }

    await prisma.conversation.create({
      data: {
        userId,
        conversationId: conversation.id,
      },
    });

    res.status(200).json({ message: "Successfully joined the group" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  createGroup,
  joinGroup,
};
