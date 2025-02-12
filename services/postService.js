const { PrismaClient } = require("@prisma/client");
const { NotFound, Unauthorized, InternalServerError } = require("../errors");
const emitter = require("../eventEmitter/eventEmitter");
const prisma = new PrismaClient();

const createPost = async (req, res, next) => {
  try {
    const imagePaths = req.files.map((file) => file.path).join(",");
    const postData = {
      caption: req.body.caption,
      imageUrl: imagePaths,
      userid: req.user.id,
    };
    const newPost = await prisma.post.create({ data: postData });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });

    emitter.emit("post.create", { userId: req.user.id, postId: newPost.id });
  } catch (error) {
    next(new InternalServerError("Failed to create the post"));
  }
};

const deletePost = async (req, res, next) => {
  const postId = parseInt(req.params.id);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { createdBy: true },
    });

    if (!post) {
      next(new NotFound("Post Not Found"));
      return;
    }

    if (req.user.id !== post.createdBy.id) {
      next(new Unauthorized("You are not authorized to delete this post."));
      return;
    }

    await prisma.post.delete({ where: { id: postId } });

    emitter.emit("post.delete", { userId: req.user.id, postId: postId });

    res.status(200).json({
      message: `Post with ID ${postId} deleted successfully`,
    });
  } catch (error) {
    next(new InternalServerError("Failed to delete the post"));
  }
};

module.exports = { createPost, deletePost };
