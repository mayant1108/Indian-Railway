import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : req.headers["x-auth-token"];

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, "The authenticated user no longer exists.");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You are not allowed to access this resource."));
  }

  next();
};
