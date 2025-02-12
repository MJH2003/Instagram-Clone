const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  HttpError,
  NotFound,
  Unauthorized,
  InternalServerError,
  BadRequest,
} = require("../errors");

const findUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return next(new BadRequest("Invalid user ID"));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new NotFound("User couldn't be found!"));
    }

    req.foundUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = findUser;
