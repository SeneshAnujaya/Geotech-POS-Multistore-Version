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
      receivedItems,
      physicalCondition,

      estimatedCost,
      expectedDeliveryDate,

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
        10,
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
        receivedItems,
        physicalCondition,

        estimatedCost: estimatedCost ? Number(estimatedCost) : null,

        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : null,

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
  const { search, status, page = 0, limit = 20, storeId } = req.query;
  
  try {
    await validateStoreIsActive(storeId);

    const pageNumber = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    const skip = pageNumber * pageLimit;

    const where = { isDeleted: false };

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

// Get Single Repair
export const getSingleRepair = async (req, res) => {
  const { repairId } = req.params;

  try {
    const repair = await prisma.repairJob.findFirst({
      where: {
        repairJobId: repairId,
        isDeleted: false,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching repair job.",
    });
  }
};

// Edit Repair Job
export const updateRepairFromTable = async (req, res) => {
  const { repairJobId } = req.params;
  const { storeId } = req.query;

  const {
    col2: customerName,
    col3: customerPhone,
    col4: deviceType,
    col5: model,
    col6: serialNumber,
    col7: technician,
    col8: status,
    col9: estimatedCost,
  } = req.body;

  try {
    await validateStoreIsActive(storeId);

    const repair = await prisma.repairJob.findUnique({
      where: {
        repairJobId,
      },
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair job not found.",
      });
    }

    const updatedRepair = await prisma.repairJob.update({
      where: {
        repairJobId,
      },
      data: {
        customerName:
          customerName !== undefined ? customerName : repair.customerName,

        customerPhone:
          customerPhone !== undefined ? customerPhone : repair.customerPhone,

        deviceType: deviceType !== undefined ? deviceType : repair.deviceType,

        model: model !== undefined ? model : repair.model,

        serialNumber:
          serialNumber !== undefined ? serialNumber : repair.serialNumber,

        technician: technician !== undefined ? technician : repair.technician,

        status: status !== undefined ? status : repair.status,

        estimatedCost:
          estimatedCost !== undefined && estimatedCost !== ""
            ? parseFloat(estimatedCost)
            : repair.estimatedCost,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Repair updated successfully.",
      repair: updatedRepair,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error updating repair.",
    });
  }
};

// Edit Single Repair Job Details page
export const updateRepairDetailsPage = async (req, res) => {

    const { repairJobId } = req.params;

    const repair = await prisma.repairJob.findUnique({
        where:{
            repairJobId
        }
    });

    if(!repair){
        return res.status(404).json({
            success:false,
            message:"Repair Job not found."
        });
    }

    const updatedRepair = await prisma.repairJob.update({
        where:{
            repairJobId
        },
        data:{
            technician: req.body.technician,
            status: req.body.status,
            expectedDeliveryDate: req.body.expectedDeliveryDate
                ? new Date(req.body.expectedDeliveryDate)
                : null,

            diagnosis: req.body.diagnosis,
            receivedItems: req.body.receivedItems,
            physicalCondition: req.body.physicalCondition,
            problemDescription: req.body.problemDescription,
            initialInspectionNotes: req.body.initialInspectionNotes,

            estimatedCost: Number(req.body.estimatedCost || 0),
            labourCost: Number(req.body.labourCost || 0),
            partsCost: Number(req.body.partsCost || 0),
            totalCost: Number(req.body.totalCost || 0),
        }
    });

    return res.status(200).json({
        success:true,
        repair:updatedRepair,
        message:"Repair Details updated successfully."
    });

}

// Delete Repair Job
export const deleteRepair = async (req, res) => {
  const { repairJobId } = req.params;

  console.log(req.params);

  try {
    const repair = await prisma.repairJob.findUnique({
      where: {
        repairJobId,
      },
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair job not found.",
      });
    }

    await prisma.repairJob.update({
      where: {
        repairJobId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Repair job deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error deleting repair job.",
    });
  }
};
