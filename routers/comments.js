const express = require("express");
const { authenticate } = require("../middlewares");
const validator = require("../middlewares/validator");
const commentSchema = require("../schemas/commentSchema");
const { commentService } = require("../services");
const router = express.Router();

router.post(
  "/",
  authenticate,
  validator(commentSchema),
  commentService.createComment
);
router.delete("/:id", authenticate, commentService.deleteComment);

module.exports = router;
