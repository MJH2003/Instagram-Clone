const Yup = require("yup");

const userSchema = Yup.object({
  username: Yup.string().required().min(4),
  password: Yup.string().required().min(6),
  email: Yup.string().email().required(),
  role: Yup.string().oneOf(["user", "admin"]).default("user"),
});

module.exports = { userSchema };
