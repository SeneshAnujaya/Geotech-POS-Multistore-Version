import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

export const checkIfSetupComplete = async (req, res, next) => {
  try {
    const setting = await prisma.systemSettings.findFirst();

    if (!setting || !setting.isSetupComplete) {
      return res.status(200).json({ success: true, setupRequired: true });
    } else {
      return res
        .status(200)
        .json({
          success: true,
          setupRequired: false,
          message: "Setup is completed!",
        });
    }
  } catch (error) {
    console.error("Error checking setup status ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkExistAdmin = async (req, res, next) => {
  try {
    const setting = await prisma.systemSettings.findFirst();

    if (!setting || !setting.isSetupComplete) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Setup is already complete. Cannot create another admin.",
      });
    }
  } catch (error) {
    console.error("Error checking setup status:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error while checking setup status",
      });
  }
};

export const signupAdmin = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const adminExists = await prisma.user.findUnique({ where: { email } });
    if (adminExists) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Check if system settings already exist
    const systemSettings = await prisma.systemSettings.findFirst();

    if (!systemSettings) {
      // If no system settings exist, create a default one
      await prisma.systemSettings.create({
        data: {
          isSetupComplete: true,
        },
      });
    } else {
      // If system settings exist, update it
      await prisma.systemSettings.updateMany({
        where: {},
        data: { isSetupComplete: true },
      });
    }

    res
      .status(201)
      .json({ success: true, message: "Admin created successfully" });
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
