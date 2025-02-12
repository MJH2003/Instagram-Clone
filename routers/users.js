const express = require("express");
const { authenticate } = require("../middlewares");
const { findUser } = require("../middlewares");
const emitter = require("../eventEmitter/eventEmitter");
// const { checkRole } = require("../middlewares");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  uId,
} = require("../services/userService");
const { date } = require("yup");
const router = express.Router();

router.get("/", authenticate, getAllUsers);
router.get("/:id", authenticate, findUser, getUserById);
router.put("/:id", authenticate, findUser, updateUser);
router.delete("/:id", authenticate, findUser, deleteUser);
router.post("/:id/follow", authenticate, followUser);
router.delete("/:id/unfollow", authenticate, unfollowUser);
router.get("/:id/followers", authenticate, getFollowers);

emitter.on("user.follow", async (data) => {
  const followerUsername = await uId(data.followerId);
  const followingUsername = await uId(data.followingId);
  console.log(
    `The User @${followerUsername.username}, followed User @${followingUsername.username}`
  );
});
emitter.on("user.delete", (data) => {
  console.log(`User With Id of ${data.id}, Just Got Deleted!`);
});

emitter.on("user.update", (data) => {
  console.log(`User With Id of ${data.id}, Just Got Updated!`);
});
module.exports = router;
