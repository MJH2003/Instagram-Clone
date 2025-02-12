const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { Unauthorized, InternalServerError } = require("../errors");

const prisma = new PrismaClient();
const SECRET_KEY = "lrhtdjfkvreshgjvncuijcmnrg";

const authToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Unauthorized("Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(new Unauthorized("User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new Unauthorized("Invalid or expired token"));
  }
};

module.exports = authToken;
