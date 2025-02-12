const express = require("express");
const { authenticate } = require("../middlewares");
const validator = require("../middlewares/validator");
const postSchema = require("../schemas/postSchema");
const { postService } = require("../services");
const upload = require("../middlewares/upload");
const emitter = require("../eventEmitter/eventEmitter");

const router = express.Router();
router.post(
  "/",
  authenticate,
  upload.array("images", 10),
  validator(postSchema),
  postService.createPost
);

router.delete("/:id", authenticate, postService.deletePost);

emitter.on("post.create", (data) => {
  console.log(
    `User With id of ${data.userId} created a Post With Id of ${data.postId}`
  );
});
emitter.on("post.delete", (data) => {
  console.log(
    `User With id of ${data.userId} deleted a Post With Id of ${data.postId}`
  );
});
module.exports = router;

// router.post(
//   "/",
//   authenticate,
//   upload.array("images", 10),
//   validator(postSchema),
//   (req, res, next) => postService.createPost(req, res, next)
// );

// router.delete("/:id", authenticate, (req, res, next) =>
//   postService.deletePost(req, res, next)
// );

// module.exports = router;
