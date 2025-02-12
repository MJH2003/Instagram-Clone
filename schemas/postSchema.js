const Yup = require("yup");

const postSchema = Yup.object({
  caption: Yup.string()
    .required("Caption is required")
    .min(1, "Caption cannot be empty")
    .max(500, "Caption cannot exceed 500 characters"),
});

module.exports = postSchema;
