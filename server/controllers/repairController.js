import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addRepair = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deviceType,
      brand,
      model,
      serialNumber,
      technician,
      problemDescription,
      assignedUserId,
      storeId,
    } = req.body;

    if (
      !customerName ||
      !customerPhone ||
      !deviceType ||
      !problemDescription ||
      !storeId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Find latest repair to generate next job number
    const latestRepair = await prisma.repairJob.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextNumber = 1;

    if (latestRepair?.jobNumber) {
      const currentNumber = parseInt(
        latestRepair.jobNumber.replace("RP-", ""),
        10
      );

      nextNumber = currentNumber + 1;
    }

    const jobNumber = `RP-${String(nextNumber).padStart(6, "0")}`;

    const repair = await prisma.repairJob.create({
      data: {
        jobNumber,

        customerName,
        customerPhone,

        deviceType,
        brand,
        model,
        serialNumber,
        technician,

        problemDescription,

        assignedUserId: assignedUserId || null,
        storeId,

        status: "RECEIVED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Repair job created successfully",
      repair,
    });
  } catch (error) {
    console.error("Add Repair Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create repair job",
      error: error.message,
    });
  }
};

