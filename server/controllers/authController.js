import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const signup = async (req, res, next) => {
  const { name, email, password, storeId } = req.body;

  if (!name || !email || !password || !storeId) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        storeId,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "user created successfully" });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const validUser = await prisma.user.findUnique({ where: { email } });

    if (!validUser) return next(errorHandler(404, "User not found!"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong Credentials!"));

    const token = jwt.sign(
      { id: validUser.id, role: validUser.role },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = validUser;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 43200000,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({ rest, success: true });
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getusers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};
