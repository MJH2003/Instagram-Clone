const express = require("express");
const { login, signup } = require("../services/authService");
const validator = require("../middlewares/validator");
const { userSchema } = require("../schemas/userSchema");
const emitter = require("../eventEmitter/eventEmitter");
const router = express.Router();

router.post("/login", login);
router.post("/signup", validator(userSchema), signup);

emitter.on("user.signup", (data) => {
  console.log(
    `A New User With Id of ${data.id} and Username of ${data.username} Just Got Created!`
  );
});
module.exports = router;
