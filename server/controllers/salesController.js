import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { validateStoreIsActive } from "../utils/validateStore.js";

const prisma = new PrismaClient();

export const recordSale = async (req, res) => {
  const { userId, items, buyerName } = req.body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }

  try {
    const sale = await prisma.$transaction(async (prisma) => {
      const newSale = await prisma.sale.create({
        data: {
          userId: userId,
          totalAmount: items.reduce(
            (total, item) => total + item.price * item.cartQuantity,
            0
          ),
          buyerName: buyerName,
        },
      });

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { sku: item.sku },
        });

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product with Code ${item.sku} not found`,
          });
        }

        if (product.quantity < item.cartQuantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: ${product.name}`,
          });
        }

        await prisma.salesItem.create({
          data: {
            saleId: newSale.saleId,
            productId: item.productId,
            quantity: item.cartQuantity,
            price: item.price,
          },
        });
      }

      return newSale;
    });
    res
      .status(201)
      .json({ success: true, message: "Sale record add successfully", sale });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "can't create sale record" });
    console.error(error.message);
  }
};

export const getAllSales = async (req, res) => {
  const { storeId } = req.query;
  try {
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
      },
      include: {
        SalesItem: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching sales" });
  }
};

// Get Paginated Sales
export const getPaginationSales = async (req, res) => {
  try {
    const { page = 0, limit = 1, searchTerm, storeId } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 0 ||
      pageSize <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    await validateStoreIsActive(storeId);

    const skip = pageNumber * pageSize;

    const searchFilter = searchTerm
      ? {
        OR: [
          { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
          { buyerName: { contains: searchTerm, mode: "insensitive" } },
          { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
      : {};

    const sales = await prisma.sale.findMany({
      where: {
        AND: [
          { storeId },
          searchFilter,
          {
            OR: [
              { saleStatus: null },
              { saleStatus: { notIn: ["CANCELED", "FULL_RETURNED"] } },
            ],
          },
        ],
      },
      include: {
        SalesItem: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    const totalSales = await prisma.sale.count({
      where: {
        AND: [
          { storeId },
          searchFilter,
          {
            OR: [
              { saleStatus: null },
              { saleStatus: { notIn: ["CANCELED", "FULL_RETURNED"] } },
            ],
          },
        ],
      },
    });

    const updateSales = await prisma.sale.updateMany({
      where: {
        saleStatus: {
          equals: null,
        },
      },
      data: {
        saleStatus: "COMPLETED",
      },
    });

    res.status(200).json({
      success: true,
      data: sales,
      total: totalSales,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching sales" });
  }
};

// Get All Outstanding Sales
export const getAllDueSales = async (req, res) => {
  const { searchTerm = "", storeId } = req.query;
  try {
    await validateStoreIsActive(storeId);

    const searchFilter = searchTerm
      ? {
        OR: [
          { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
          { buyerName: { contains: searchTerm, mode: "insensitive" } },
          { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
      : {};

    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },

        ...searchFilter,
      },
      include: {
        SalesItem: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching sales" });
  }
};

// Get Total Revenue
export const getTotalRevenue = async (req, res) => {
  const { storeId } = req.params;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  try {
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        NOT: {
          saleStatus: {
            in: ["CANCELED", "FULL_RETURNED"],
          },
        },
      },
      select: {
        paidAmount: true,
      },
    });

    const totalRevenueFromSales = sales.reduce((sum, sale) => {
      return sum + parseFloat(sale.paidAmount || 0);
    }, 0);

    const laterPayments = await prisma.payment.findMany({
      where: {
        sale: {
          storeId,
        },
      },
      select: {
        paymentAmount: true,
      },
    });

    const totalLaterPayments = laterPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.paymentAmount || 0);
    }, 0);

    const allTotalRev = totalRevenueFromSales + totalLaterPayments;

    res.status(200).json({
      success: true,
      totalRevenue: Number(allTotalRev).toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to calculate total revenue" });
  }
};

export const getSalesCount = async (req, res) => {
  const { storeId } = req.params;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  try {
    const totalSalesCount = await prisma.sale.count({
      where: {
        storeId,
        NOT: {
          saleStatus: {
            in: ["CANCELED"],
          },
        },
      },
    });

    res.status(200).json({ success: true, totalSalesCount });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get total sales count" });
  }
};

// Get Daily Revenue
export const getDailyRevenue = async (req, res) => {
  const storeId = req.params.storeId;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  try {
    const today = new Date();
    const salesToday = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
        NOT: {
          saleStatus: {
            in: ["CANCELED", "FULL_RETURNED"],
          },
        },
      },
      select: {
        paidAmount: true,
      },
    });

    const dailySalesRevenue = salesToday.reduce((sum, sale) => {
      return sum + parseFloat(sale.paidAmount || 0);
    }, 0);

    const paymentsToday = await prisma.payment.findMany({
      where: {
        storeId,
        paymentDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      select: {
        paymentAmount: true,
      },
    });

    const dailyPayRevenue = paymentsToday.reduce((total, payment) => {
      const totalPayments = parseFloat(payment.paymentAmount || 0);
      return total + totalPayments;
    }, 0);

    const totalDailyRev = dailySalesRevenue + dailyPayRevenue;

    res
      .status(200)
      .json({ success: true, dailyRevenue: Number(totalDailyRev).toFixed(2) });
  } catch (error) {
    console.error("Error getting daily revenue:", error);
    res.status(500).json({
      success: false,
      message: "Error getting daily revenue",
    });
  }
};

export const getMonthlySaleCount = async (req, res) => {
  const storeId = req.params.storeId;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  try {
    const today = new Date();

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const salesThisMonth = await prisma.sale.count({
      where: {
        storeId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
        NOT: {
          saleStatus: "CANCELED",
        },
      },
    });

    res.status(200).json({
      success: true,
      monthlySalesCount: salesThisMonth,
    });
  } catch (error) {
    console.error("Error getting monthly sales count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting monthly sales count",
    });
  }
};

// Get Monthly Revenue
export const getMonthlyRevenue = async (req, res) => {
  const storeId = req.params.storeId;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID is required",
    });
  }

  try {
    const today = new Date();
    const startOfMonthDate = startOfMonth(today);
    const endOfMonthDate = endOfMonth(today);

    const salesThisMonth = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startOfMonthDate,
          lte: endOfMonthDate,
        },
        NOT: {
          saleStatus: {
            in: ["CANCELED", "FULL_RETURNED"],
          },
        },
      },
      select: {
        paidAmount: true,
      },
    });

    const laterPaymentsThisMonth = await prisma.payment.findMany({
      where: {
        storeId,
        paymentDate: {
          gte: startOfMonthDate,
          lte: endOfMonthDate,
        },
      },
      select: {
        paymentAmount: true,
      },
    });

    const monthlySalesRev = salesThisMonth.reduce((total, sale) => {
      const paidAmount = parseFloat(sale.paidAmount || 0);
      return total + paidAmount;
    }, 0);

    const monthlyPaymentsRev = laterPaymentsThisMonth.reduce(
      (total, payments) => {
        const paymentsAmount = parseFloat(payments.paymentAmount || 0);
        return total + paymentsAmount;
      },
      0
    );

    // const monthlyTotalRev =
    //   monthlySalesRev - excludedMonthlySalesTotalRev + monthlyPaymentsRev;
    const monthlyTotalRev = monthlySalesRev + monthlyPaymentsRev;

    res.status(200).json({
      success: true,
      monthlyRevenue: Number(monthlyTotalRev).toFixed(2),
    });
  } catch (error) {
    console.error("Error getting monthly revenue: ", error);
    res.status(500).json({
      success: false,
      message: "Error getting monthly revenue",
    });
  }
};

// Generate Invoice Number
const generateInvoiceNumber = async (prisma) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Get the count of sales for today to use as a sequential number
  const salesCount = await prisma.sale.count({
    where: {
      createdAt: {
        gte: new Date(year, date.getMonth(), day), // Start of the day
        lt: new Date(year, date.getMonth(), day + 1), // Start of the next day
      },
    },
  });

  // Format the invoice number
  const invoiceNumber = `INV-${year}-${month}-${day}-${String(
    salesCount + 1
  ).padStart(3, "0")}`;
  return invoiceNumber;
};

// Record sale and update stock when print invoice
export const createSaleRecordWithStockUpdate = async (req, res) => {
  const {
    userId,
    items,
    clientName,
    phoneNumber,
    discount,
    paidAmount,
    grandTotal,
    isBulkBuyer,
    selectedClientId,
    currentUserName,
    serviceCharge,
    serviceDesc,
    storeId,
  } = req.body;

  if (
    !userId ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !clientName ||
    !phoneNumber
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "storeId is required",
    });
  }

  try {
    // Start transaction
    const sale = await prisma.$transaction(
      async (prisma) => {
        // generate Invoice Number
        const invoiceNumber = await generateInvoiceNumber(prisma);

        // step one - create sale record
        const newSale = await prisma.sale.create({
          data: {
            userId: userId,
            totalAmount: items.reduce(
              (total, item) => total + item.price * item.cartQuantity,
              0
            ),
            paidAmount: parseFloat(paidAmount),
            paymentStatus:
              Number(paidAmount) === 0
                ? "UNPAID"
                : Number(paidAmount) >= Number(grandTotal)
                  ? "FULL PAID"
                  : "PARTIALLY_PAID",
            buyerName: clientName,
            phoneNumber,
            bulkBuyerId: selectedClientId ? selectedClientId : null,
            discount: parseFloat(discount),
            invoiceNumber,
            cashierName: currentUserName,
            serviceCharge: Number(serviceCharge) || 0,
            serviceDescription: serviceDesc || null,
            storeId,
          },
        });

        const productSkus = items.map((item) => item.sku);

        const products = await prisma.product.findMany({
          where: { sku: { in: productSkus } },
          select: { productId: true, sku: true, name: true },
        });

        const productMap = new Map(products.map((p) => [p.sku, p]));

        const stocks = await prisma.stock.findMany({
          where: {
            storeId: storeId,
            productId: { in: products.map((p) => p.productId) },
          },
        });

        const stockMap = new Map(
          stocks.map((s) => [`${s.productId}_${s.storeId}`, s])
        );


        for (const item of items) {
          // const product = await prisma.product.findUnique({
          //   where: { sku: item.sku },
          // });
          // const product = products.find((p) => p.sku === item.sku);
          const product = productMap.get(item.sku);

          if (!product) {
            throw new Error(`Product with SKU ${item.sku} not found`);
          }

          const stock = stockMap.get(`${product.productId}_${storeId}`);

          //  console.log(stock);


          if (!stock) {
            throw new Error(`No stock found for product: ${product.name}`);
          }

          // if (product.quantity < item.cartQuantity) {
          //   throw new Error(`Not enough stock for product: ${product.name}`);
          // }

          if (stock.quantity < item.cartQuantity) {
            throw new Error(`Not enough stock for product: ${product.name}`);
          }
        }

        // Create SalesItem
        // await prisma.salesItem.create({
        //   data: {
        //     saleId: newSale.saleId,
        //     productId: item.productId,
        //     quantity: item.cartQuantity,
        //     price: item.price,
        //     warrantyPeriod: item.warrantyPeriod,
        //   },
        // });

        // New add step 3 - Create Sales Items in Bulk
        await prisma.salesItem.createMany({
          data: items.map((item) => ({
            saleId: newSale.saleId,
            productId: item.productId,
            quantity: item.cartQuantity,
            price: item.price,
            warrantyPeriod: item.warrantyPeriod,
          })),
        });

        // New add step 4 - Bulk Update Stock
        // const updateStockQueries = items.map((item) =>
        //   prisma.product.update({
        //     where: { sku: item.sku },
        //     data: { quantity: { decrement: item.cartQuantity } },
        //   })
        // );
        const updateStockQueries = items.map((item) => {
          const product = productMap.get(item.sku);

          return prisma.stock.update({
            where: {
              productId_storeId: {
                productId: product.productId,
                storeId: storeId,
              },
            },
            data: {
              quantity: {
                decrement: item.cartQuantity,
              },
            },
          });
        });


        await Promise.all(updateStockQueries);

        // Update Stock
        // await prisma.product.update({
        //   where: { sku: item.sku },
        //   data: { quantity: product.quantity - item.cartQuantity },
        // });

        if (selectedClientId) {
          const bulkBuyer = await prisma.bulkBuyer.update({
            where: { bulkBuyerId: selectedClientId },
            data: {
              outstandingBalance: {
                increment: grandTotal - Number(paidAmount),
              },
            },
          });
        }
        return newSale;
      },
      { timeout: 40000 }
    );

    res.status(201).json({
      success: true,
      message: "Sale record and stock updated successfully",
      sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "Sale record and stock updated Transaction failed",
    });
    console.error("Transaction failed: ", error.message);
  }
};

// Cancel Sale Record
export const cancelSaleRecord = async (req, res) => {
  const { saleId, saleStatus, returnQty, storeId } = req.body;

  if (!saleId || !saleStatus) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "storeId is required",
    });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { saleId: saleId },
      include: {
        SalesItem: {
          include: {
            product: true,
          },
        },
        bulkBuyer: true,
      },
    });

    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "Sale record not found" });
    }

    if (saleStatus === "cancel" || saleStatus === "full_return") {
      await prisma.$transaction(async (prisma) => {
        // Update Stock
        // for (const item of sale.SalesItem) {
        //   const product = await prisma.product.findUnique({
        //     where: { sku: item.product.sku },
        //   });

        //   await prisma.product.update({
        //     where: { sku: item.product.sku },
        //     data: { quantity: product.quantity + item.quantity },
        //   });
        // }

        for (const item of sale.SalesItem) {
          await prisma.stock.update({
            where: {
              productId_storeId: {
                productId: item.productId,
                storeId: storeId,
              },
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        const grandTotal =
          sale.totalAmount - sale.discount + sale.serviceCharge;

        // Update Bulk Buyer outstanding balance
        if (
          (sale.bulkBuyerId && sale.paymentStatus === "PARTIALLY_PAID") ||
          sale.paymentStatus === "UNPAID"
        ) {
          const bulkBuyer = await prisma.bulkBuyer.update({
            where: { bulkBuyerId: sale.bulkBuyerId },
            data: {
              outstandingBalance: {
                decrement: grandTotal - sale.paidAmount,
              },
            },
          });
        }

        // update Sale record status t CANCELED
        await prisma.sale.update({
          where: { saleId: saleId },
          data: {
            saleStatus: saleStatus == "cancel" ? "CANCELED" : "FULL_RETURNED",
          },
        });
      });

      return res.status(200).json({
        success: true,
        message: "Sale record cancelled successfully",
      });
    }

    if (saleStatus === "half_return") {
      await prisma.$transaction(async (prisma) => {
        let returnedItemPriceTotal = 0;
        const returnItemsData = [];

        for (const item of sale.SalesItem) {
          const returnedQuantity = returnQty[item.product.sku] || 0;

          if (returnedQuantity > 0) {
            // const product = await prisma.product.findUnique({
            //   where: { sku: item.product.sku },
            // });

            // await prisma.product.update({
            //   where: { sku: item.product.sku },
            //   data: { quantity: product.quantity + returnedQuantity },
            // });

            await prisma.stock.update({
              where: {
                productId_storeId: {
                  productId: item.productId,
                  storeId: storeId,
                },
              },
              data: {
                quantity: {
                  increment: returnedQuantity,
                },
              },
            });

            returnedItemPriceTotal += item.price * returnedQuantity;

            returnItemsData.push({
              productId: item.productId,
              quantity: returnedQuantity,
              price: item.price,
            });
          }
        }

        if (returnItemsData.length > 0) {
          const newReturnSale = await prisma.sale.create({
            data: {
              userId: sale.userId,
              totalAmount: returnedItemPriceTotal,
              paidAmount: 0,
              paymentStatus: "UNPAID",
              buyerName: sale.buyerName,
              phoneNumber: sale.phoneNumber,
              bulkBuyerId: sale.bulkBuyerId,
              discount: 0,
              invoiceNumber: sale.invoiceNumber,
              cashierName: sale.cashierName,
              serviceCharge: 0,
              serviceDescription: null,
              saleStatus: "FULL_RETURNED",
              returnSaleId: sale.saleId,
            },
          });

          const salesItemsData = returnItemsData.map((item) => ({
            saleId: newReturnSale.saleId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }));

          await prisma.salesItem.createMany({
            data: salesItemsData,
          });
        }

        const updatedReturnItemTotal =
          sale.returnedItemsTotal + returnedItemPriceTotal;

        // update original sale record
        await prisma.sale.update({
          where: { saleId: saleId },
          data: {
            saleStatus: "HALF_RETURNED",
            returnedItemsTotal: updatedReturnItemTotal,
          },
        });

        // Update Bulk Buyer outstanding balance
        if (
          sale.bulkBuyerId &&
          (sale.paymentStatus === "PARTIALLY_PAID" ||
            sale.paymentStatus === "UNPAID")
        ) {
          const bulkBuyer = await prisma.bulkBuyer.update({
            where: { bulkBuyerId: sale.bulkBuyerId },
            data: {
              outstandingBalance: {
                decrement: Math.min(
                  returnedItemPriceTotal,
                  sale.bulkBuyer?.outstandingBalance || 0
                ),
              },
            },
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: "Sale record half returned successfully",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid sale status",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel sale record",
    });
    console.error("Failed to cancel sale record: ", error.message);
  }
};

// Get All Cancel and Return Sales
export const getAllReturnCancelSales = async (req, res) => {
  const { searchTerm = "", storeId } = req.query;
  try {
    await validateStoreIsActive(storeId);

    const searchFilter = searchTerm
      ? {
        OR: [
          { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
          { buyerName: { contains: searchTerm, mode: "insensitive" } },
          { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
          { saleStatus: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
      : {};

    const returnCancelSales = await prisma.sale.findMany({
      where: {
        storeId,
        saleStatus: { in: ["CANCELED", "FULL_RETURNED"] },
        ...searchFilter,
      },
      include: {
        SalesItem: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ success: true, data: returnCancelSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching return & cancel sales",
    });
  }
};

// Get Recent 14 Days Sales
export const getRecent14DaySales = async (req, res) => {
  const storeId = req.query.storeId;
  try {
    const latestSales = await prisma.sale.findMany({
      where: {
        storeId,
        saleStatus: {
          notIn: ["CANCELED", "FULL_RETURNED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
    res.status(200).json({ success: true, data: latestSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent 14 Days sales",
    });
  }
};
