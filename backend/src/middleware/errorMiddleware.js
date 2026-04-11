import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details ?? null;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message =
      error.keyPattern?.seatAllocationKeys || error.message?.includes("unique_seat_allocation_key_idx")
        ? "One or more selected seats were just booked. Please pick different seats."
        : "A conflicting record already exists.";
    details = error.keyValue ?? null;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session is invalid or has expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
