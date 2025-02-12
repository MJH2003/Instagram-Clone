const Yup = require("yup");
const commentSchema = Yup.object({
  body: Yup.string()
    .required("Comment body is required")
    .min(1, "Comment cannot be empty")
    .max(300, "Comment cannot exceed 1000 characters"),
  postid: Yup.number().required("You must Enter The Post Id"),
});

module.exports = commentSchema;
