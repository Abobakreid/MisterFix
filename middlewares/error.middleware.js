const errorMiddlewareHandler = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    //mongoose bad objectId
    if (err.name === "CastError") {
      const message = "Resource not found due to invalid ID";
      error = new Error(message);
      error.statusCode = 404;
    }
    // mongoose  duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value entered for ${field}`;
      error = new Error(message);
      error.statusCode = 400;
    }

    // mongoose  validation error
    if (err.name === "ValidationError") {
      const filterMessages = Object.values(err.errors).map(
        (val) => val.message
      );
      error = new Error(filterMessages.join(", "));
      error.statusCode = 400;
    }

    if (err.type === "entity.parse.failed") {
      const message = "Invalid JSON payload";
      error = new Error(message);
      error.statusCode = 400;
    }

    const statuscode = error.statusCode || 500;
    res.status(statuscode).json({
      success: false,
      message: error.message || "Server Error",
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddlewareHandler;
