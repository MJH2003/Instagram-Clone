const { BadRequest } = require("../errors");
const Yup = require("yup");

const validator = (schema) => {
  return async (req, res, next) => {
    try {
      const data = await schema.validate(req.body, { stripUnknown: true });
      req.data = data;
      next();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = err.errors.join(", ");
        return next(new BadRequest(`Validation failed. Errors: ${errors}`));
      }
      return next(err);
    }
  };
};

module.exports = validator;
