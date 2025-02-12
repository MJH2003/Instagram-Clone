class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.message = message;
    this.details = details;
  }

  toJson() {
    return {
      status: this.status,
      message: this.message,
      details: this.details,
    };
  }
}

class NotFound extends HttpError {
  constructor(message = "Resource not found", details = null) {
    super(404, message, details);
  }
}

class Unauthorized extends HttpError {
  constructor(message = "Unauthorized access", details = null) {
    super(401, message, details);
  }
}

class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error", details = null) {
    super(500, message, details);
  }
}

class BadRequest extends HttpError {
  constructor(message = "Bad Request", details = null) {
    super(400, message, details);
  }
}

module.exports = {
  HttpError,
  NotFound,
  Unauthorized,
  InternalServerError,
  BadRequest,
};
