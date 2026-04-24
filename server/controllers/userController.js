import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { validateStoreIsActive } from "../utils/validateStore.js";

const prisma = new PrismaClient();

export const getusers = async (req, res, next) => {
  const { storeId } = req.query;  
  
  try {
    await validateStoreIsActive(storeId);

    const users = await prisma.user.findMany({
      where: { storeId: storeId },
      // where: {
      //   role: "EMPLOYEE",
      // },
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
    console.log(error);
    
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const deleteuser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: id },
    });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Error deleting user!" });
  }
};

// Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { col2: name, col3: email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { name, email },
    });

    if (updatedUser) {
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updateUser,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

// Update User account
export const updateUserAccount = async (req, res) => {
  const { id, name, email, currentPassword, newPassword } = req.body;

  if (!name || !email || !currentPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "name email or current password cannot empty",
      });
  }

  try {
    const validUser = await prisma.user.findUnique({ where: { id } });

    if (!validUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (currentPassword) {
      const validPassword = bcryptjs.compareSync(
        currentPassword,
        validUser.password
      );

      if (!validPassword) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid Current Password!" });
      }
    }

    const updateData = {
      name,
      email,
    };

    if (newPassword) {
      if (validUser.role !== "ADMIN") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized to change password!",
          });
      }
      updateData.password = bcryptjs.hashSync(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (updatedUser) {
      return res.status(200).json({
        success: true,
        message: "Account updated successfully",
        data: updateUser,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Error updating user" });
  }
};
