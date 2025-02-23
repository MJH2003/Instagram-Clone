const { PrismaClient } = require("@prisma/client");
const { NotFound, Unauthorized, InternalServerError } = require("../errors");

const prisma = new PrismaClient();

const createComment = async (req, res, next) => {
  try {
    const newComment = await prisma.comment.create({
      data: {
        body: req.data.body,
        userId: req.user.id,
        postId: parseInt(req.data.postId),
      },
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    next(new InternalServerError("Failed to create the comment"));
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      next(new NotFound("Comment Not Found"));
      return;
    }

    if (req.user.id !== comment.author.id) {
      next(new Unauthorized("You are not authorized to delete this comment."));
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res
      .status(200)
      .json({ message: `Comment with ID ${commentId} deleted successfully` });
  } catch (error) {
    next(new InternalServerError());
  }
};

module.exports = { createComment, deleteComment };
