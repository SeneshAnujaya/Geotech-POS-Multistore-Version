import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { errorHandler } from "../utils/error.js";

const prisma = new PrismaClient();

const generateNextReceiptNumber = async () => {
  const latestPayment = await prisma.payment.findFirst({
    orderBy: { receiptNumber: "desc" },
  });

  let nextReceiptNumber = "REC-0000001";

  if (latestPayment && latestPayment.receiptNumber) {
    const currentNumber = parseInt(latestPayment.receiptNumber.split("-")[1]);
    const incrementedNumber = currentNumber + 1;

    nextReceiptNumber = `REC-${String(incrementedNumber).padStart(6, "0")}`;
  }

  return nextReceiptNumber;
};

export const createPayment = async (req, res) => {
  // const saleId = req.body.saleId;
  const payAmount = Number(req.body.payAmount);
  const bulkBuyerId = req.body.bulkBuyerId ? req.body.bulkBuyerId : null;
  const storeId = req.body.storeId ? req.body.storeId : null;

  const receiptNumber = await generateNextReceiptNumber();

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          paymentAmount: payAmount,
          bulkBuyerId: bulkBuyerId,
          receiptNumber,
          storeId
        },
      });

      if (bulkBuyerId) {
        const updatedBulkBuyer = await prisma.bulkBuyer.update({
          where: { bulkBuyerId: bulkBuyerId },
          data: {
            outstandingBalance: { decrement: payAmount },
          },
        });
      }

      return payment;
    });

    res.status(201).json({
      success: true,
      message: "Payment added & sale record update successfully! ",
      payment: result,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "payment & sale record update failed!",
    });
  }
};

// get payements for register member
export const getSingleClientPayments = async (req, res) => {
  const { id } = req.params;

  try {
    const clientPayments = await prisma.payment.findMany({
      where: {
        bulkBuyerId: id,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    res.status(200).json({ success: true, data: clientPayments });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching client payments" });
    console.log(error);
  }
};
