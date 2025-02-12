const { PrismaClient } = require("@prisma/client");
const {
  NotFound,
  Unauthorized,
  InternalServerError,
  BadRequest,
} = require("../errors");
const emitter = require("../eventEmitter/eventEmitter");
const prisma = new PrismaClient();

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        posts: true,
        followers: true,
        following: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(new InternalServerError("Failed to fetch users"));
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.foundUser.id },
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        posts: true,
        followers: true,
        following: true,
      },
    });
    if (!user) next(new NotFound("User not found"));
    else res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: req.foundUser.id },
      data: req.body,
    });

    emitter.emit("user.update", { id: req.foundUser.id });

    res.status(200).json({
      message: `User With Id of ${req.foundUser.id} got updated successfully`,
    });
  } catch (error) {
    next(new InternalServerError("Couldn't update the user"));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await prisma.users.delete({
      where: { id: req.foundUser.id },
    });

    emitter.emit("user.delete", { id: req.foundUser.id });

    res
      .status(200)
      .json({ message: `User With Id Of ${req.foundUser.id}, Got Deleted` });
  } catch (error) {
    next(new InternalServerError("User not found or deletion failed"));
  }
};

const followUser = async (req, res, next) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.user.id;

  if (followerId === followingId) {
    return next(new BadRequest("You cannot follow yourself."));
  }

  try {
    const userToFollow = await prisma.users.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return next(new NotFound("User to follow not found"));
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existingFollow) {
      return next(new BadRequest("You are already following this user."));
    }

    await prisma.follows.create({
      data: {
        followerId,
        followingId,
      },
    });

    emitter.emit("user.follow", { followingId, followerId });

    res
      .status(200)
      .json({ message: `You are now following user ${followingId}.` });
  } catch (error) {
    next(new InternalServerError("Failed to follow user."));
  }
};

const unfollowUser = async (req, res, next) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.user.id;

  if (followingId === followerId) {
    return next(new BadRequest("You cannot unfollow yourself."));
  }

  try {
    await prisma.follows.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    emitter.emit("user.unfollow", { followingId, followerId });

    res.status(200).json({ message: `You unfollowed user ${followingId}.` });
  } catch (error) {
    next(new InternalServerError("Failed to unfollow the user."));
  }
};

const getFollowers = async (req, res, next) => {
  const userId = parseInt(req.params.id);

  try {
    const followers = await prisma.follows.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!followers || followers.length === 0) {
      return next(new NotFound("No followers found for this user."));
    }

    const followerList = followers.map((f) => f.follower);

    res.status(200).json(followerList);
  } catch (error) {
    next(new InternalServerError("Failed to fetch followers."));
  }
};

const uId = async (iddd) => {
  const user = await prisma.users.findUnique({
    where: { id: iddd },
    select: {
      username: true,
    },
  });
  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  uId,
};
