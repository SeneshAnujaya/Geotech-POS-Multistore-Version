import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getStocks = async (req, res) => {
  try {
    const { page = 0, limit = 20, searchTerm = "", storeId } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = pageNumber * pageSize;

    if (isNaN(pageNumber) || isNaN(pageSize) || pageSize <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }


    const where = {
      ...(storeId ? { storeId } : {}),
      isDeleted: false,
      product: {
        isDeleted: false,
        ...(searchTerm && {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { sku: { contains: searchTerm, mode: "insensitive" } },
          ],
        }),
      },
    };

    const stocks = await prisma.stock.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        quantity: true,
        updatedAt: true,
        createdAt: true,
        product: {
          select: {
            productId: true,
            name: true,
            sku: true,
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

    const total = await prisma.stock.count({ where });

    res.status(200).json({
      success: true,
      data: stocks,
      total,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error("Error fetching stock table:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load stock",
    });
  }
};

export const addStock = async (req, res) => {
  try {
    const { productId, storeId, quantity } = req.body;

    if (!productId || !storeId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId, storeId, quantity required",
      });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }
 

    const stock = await prisma.stock.upsert({
      where: {
        productId_storeId: { productId, storeId },
      },
      update: {
        quantity: { increment: qty },
        isDeleted: false,
      },
      create: {
        productId,
        storeId,
        quantity: qty,
        isDeleted: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Add stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add stock",
    });
  }
};

// Update Stock 
export const updateStock = async (req, res) => {

  try {
    const { id: stockId, storeId, quantity } = req.body;

    const qty =
      typeof quantity === "object"
        ? Number(Object.values(quantity)[0])
        : Number(quantity);



    if (!stockId || !storeId || qty === undefined) {
      return res.status(400).json({
        success: false,
        message: "stockId, storeId, quantity required",
      });
    }


    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be 0 or greater",
      });
    }

    // Ensure stock exists
   const existingStock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        storeId,
      },
    });

    if (!existingStock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found for this product & store",
      });
    }

     const updatedStock = await prisma.stock.update({
      where: {
        id: existingStock.id,
      },
      data: {
        quantity: qty,
      },
    });

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updatedStock,
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

// Delete Stock (Soft Delete)
export const deleteStock = async (req, res) => {
  try {
    const stockId = req.params.id;
    const { storeId } = req.body;

    if (!stockId || !storeId) {
      return res.status(400).json({
        success: false,
        message: "stockId and storeId required",
      });
    }

    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        storeId,
        isDeleted: false,
      },
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found or already deleted",
      });
    }

    await prisma.stock.update({
      where: { id: stockId, storeId },
      data: {
        isDeleted: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Delete stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete stock",
    });
  }
};


