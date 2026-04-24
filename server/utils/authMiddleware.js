import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Forbidden"));
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  const token = req.cookies.access_token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized request" });
    }

    next();
  } catch (error) {
    return next(errorHandler(403, "Invalid token"));
  }
};
