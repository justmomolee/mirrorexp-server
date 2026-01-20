import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findById(decoded._id);

    if (!user) return res.status(401).send({ message: "Invalid token user." });

    req.authUser = user;
    next();
  } catch (ex) {
    return res.status(401).send({ message: "Invalid or expired token." });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.authUser || !req.authUser.isAdmin) {
    return res.status(403).send({ message: "Admin access required." });
  }
  next();
};
