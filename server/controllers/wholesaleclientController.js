import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../utils/error.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export const addBulkBuyer = async (req, res) => {
  const { clientName, phonenumber, email, companyName, clientType } = req.body;

  if (!clientName || !phonenumber) {
    return res.status(400).json({
      success: false,
      message: "Client name and Phone number are required",
    });
  }

  if (!clientType) {
    return res.status(400).json({
      success: false,
      message: "Client type is required!",
    });
  }

  try {
    const existingClient = await prisma.bulkBuyer.findFirst({
      where: {
        OR: [{ name: clientName }, { phoneNumber: phonenumber }],
      },
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "A client with the same name or phone number already exists",
      });
    }

    const newBulkBuyer = await prisma.bulkBuyer.create({
      data: {
        name: clientName,
        phoneNumber: phonenumber,
        email,
        companyName,
        outstandingBalance: 0.0,
        type: clientType,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Client added successfully",
      data: newBulkBuyer,
    });
  } catch (error) {
    console.error("Error adding clients:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding clients",
      error: error.message,
    });
  }
};

// Get Wholesale Clients Infomation

export const getBulkBuyers = async (req, res, next) => {
  const { searchTerm } = req.query;
  try {
    let bulkBuyersData;
    if (searchTerm) {
      bulkBuyersData = await prisma.bulkBuyer.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              phoneNumber: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              companyName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
      });
    } else {
      bulkBuyersData = await prisma.bulkBuyer.findMany();
    }    

    res.status(200).json({ success: true, data: bulkBuyersData });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching bulkBuyers info" });
    console.log(error);
  }
};

// Update Wholesale Clients

export const updateBulkBuyer = async (req, res) => {
  const { id } = req.params;
  const {
    col2: name,
    col3: phoneNumber,
    col4: email,
    col5: companyName,
  } = req.body;

  try {
    const bulkBuyer = await prisma.bulkBuyer.findUnique({
      where: {
        bulkBuyerId: id,
      },
    });

    if (!bulkBuyer) {
      return res
        .status(404)
        .json({ success: false, message: "Client is not found" });
    }

    const updatedBulkBuyer = await prisma.bulkBuyer.update({
      where: { bulkBuyerId: id },
      data: { name, phoneNumber, email, companyName },
    });

    if (updatedBulkBuyer) {
      return res.status(200).json({
        success: true,
        message: "Wholesale client updated successfully",
        data: updatedBulkBuyer,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Error updating client" });
  }
};

//   Delete Wholesale Client

export const deleteBulkBuyer = async (req, res) => {
  const { id } = req.params;

  try {
    const bulkBuyer = await prisma.bulkBuyer.findUnique({
      where: { bulkBuyerId: id },
    });

    if (!bulkBuyer) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    if (bulkBuyer.outstandingBalance > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete BulkBuyer with outstanding balance.",
      });
    }

    await prisma.bulkBuyer.delete({
      where: { bulkBuyerId: id },
    });

    res
      .status(200)
      .json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting client!" });
  }
};
