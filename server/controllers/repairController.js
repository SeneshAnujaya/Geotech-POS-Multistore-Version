import { PrismaClient } from "@prisma/client";
import { validateStoreIsActive } from "../utils/validateStore.js";

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

export const getRepairs = async (req, res) => {
  const {
    search,
    status,
    page = 0,
    limit = 20,
    storeId,
  } = req.query;

  try {
    await validateStoreIsActive(storeId);

    const pageNumber = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    const skip = pageNumber * pageLimit;

    const where = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          customerName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customerPhone: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          jobNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          serialNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const repairs = await prisma.repairJob.findMany({
      where,
      skip,
      take: pageLimit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            storeId: true,
            name: true,
          },
        },
      },
    });

    const totalCount = await prisma.repairJob.count({
      where,
    });

    return res.status(200).json({
      success: true,
      repairs,
      total: totalCount,
      page: pageNumber,
      limit: pageLimit,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching repair jobs",
    });
  }
};
