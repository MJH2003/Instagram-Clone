const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { Unauthorized, InternalServerError, BadRequest } = require("../errors");
const emitter = require("../eventEmitter/eventEmitter");

const prisma = new PrismaClient();
const SECRET_KEY = "lrhtdjfkvreshgjvncuijcmnrg";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequest("Username and password are required");
    }

    const user = await prisma.users.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Unauthorized("Invalid username or password");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw new BadRequest("Username, email, and password are required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: { username, email, password: hashedPassword, role },
    });

    emitter.emit("user.signup", { id: newUser.id, username: newUser.username });
    res.json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, signup };
