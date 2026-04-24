import { PrismaClient } from "@prisma/client";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

// Create Store
export const createStore = async (req, res) => {
  const { storeName, address, phoneNumber } = req.body;

  if (!storeName || !address) {
    return res.status(400).json({
      success: false,
      message: "Store Name and address are required",
    });
  }

  try {
    const existingStore = await prisma.store.findFirst({
      where: { name: storeName.trim() },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "A store name already exists",
      });
    }

    const newStore = await prisma.store.create({
      data: {
        name: storeName.trim(),
        address: address.trim(),
        contact: phoneNumber?.trim() || null,
      },
    });

    res.status(201).json({ success: true, data: newStore });
  } catch (error) {
    // console.error("Error creating store:", error);
    res.status(500).json({ success: false, message: "error creating store" });
  }
};

// Update store
export const updateStore = async (req, res) => {
  const { id } = req.params;

  const { col2: name, col3: address, col4: contact } = req.body;

  if (!name && !address && !contact) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update.",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid store ID format",
    });
  }

  try {
    const store = await prisma.store.findUnique({ where: { storeId: id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const updatedStore = await prisma.store.update({
      where: { storeId: id },
      data: {
        name: name.trim(),
        address: address.trim(),
        contact: contact?.trim() || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: updatedStore,
    });
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({ success: false, message: "error updating store" });
  }
};

// Delete store
export const deleteStore = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid store ID format",
    });
  }

  try {
    const store = await prisma.store.findUnique({ where: { storeId: id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Perform soft delete by setting a 'deleted' flag
    await prisma.store.update({
      where: { storeId: id },
      data: { isDeleted: true, status: "DISABLED" },

    });

    res
      .status(200)
      .json({ success: true, message: "Store deleted successfully!" });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ success: false, message: "error deleting store" });
  }
};

// Get all stores
export const getStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({ where: { isDeleted: false, status: "ACTIVE" } });
    res.status(200).json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stores" });
  }
};
