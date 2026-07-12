import { PrismaClient } from "@prisma/client";
import { validateStoreIsActive } from "../utils/validateStore.js";

const prisma = new PrismaClient();

const largestExistingNumber = async (tx, documentType, prefix) => {
  let numbers = [];
  if (documentType === "REPAIR_JOB") {
    numbers = (await tx.repairJob.findMany({ select: { jobNumber: true } })).map((record) => record.jobNumber);
  } else if (documentType === "PAYMENT_RECEIPT") {
    numbers = (await tx.payment.findMany({ where: { receiptNumber: { not: null } }, select: { receiptNumber: true } })).map((record) => record.receiptNumber);
  } else if (documentType === "REPAIR_INVOICE") {
    numbers = (await tx.repairInvoice.findMany({ select: { invoiceNumber: true } })).map((record) => record.invoiceNumber);
  }

  const matcher = new RegExp(`^${prefix}-(\\d+)$`);
  return numbers.reduce((highest, number) => {
    const match = number?.match(matcher);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
};

const nextDocumentNumber = async (tx, documentType, storeId, prefix) => {
  const largestExisting = await largestExistingNumber(tx, documentType, prefix);
  const existingCounter = await tx.documentCounter.findFirst({ where: { documentType } });

  let counter;
  if (!existingCounter) {
    counter = await tx.documentCounter.create({
      data: { documentType, storeId, sequence: largestExisting + 1 },
    });
  } else {
    // Bring an earlier counter forward when the system already has legacy documents.
    if (existingCounter.sequence < largestExisting) {
      await tx.documentCounter.update({
        where: { id: existingCounter.id },
        data: { sequence: largestExisting },
      });
    }
    counter = await tx.documentCounter.update({
      where: { id: existingCounter.id },
      data: { sequence: { increment: 1 } },
    });
  }

  return `${prefix}-${String(counter.sequence).padStart(6, "0")}`;
};

const paymentStatusFor = (totalAmount, paidAmount) => {
  if (paidAmount <= 0) return "UNPAID";
  if (paidAmount >= totalAmount) return "FULL_PAID";
  return "PARTIALLY_PAID";
};

const findRepairInStore = async (repairJobId, storeId, include = {}) => {
  if (!storeId) {
    const error = new Error("storeId is required");
    error.statusCode = 400;
    throw error;
  }

  const { repairParts: repairPartsInclude, ...repairInclude } = include;

  const repair = await prisma.repairJob.findFirst({
    where: { repairJobId, storeId, isDeleted: false },
    include: repairInclude,
  });

  if (!repair) {
    const error = new Error("Repair job not found for this store");
    error.statusCode = 404;
    throw error;
  }

  if (repairPartsInclude) {
    repair.repairParts = await prisma.repairPart.findMany({
      where: { repairJobId },
      ...repairPartsInclude,
    });
  }

  return repair;
};

export const addRepair = async (req, res) => {
  const {
    customerName, customerPhone, deviceType, brand, model, serialNumber,
    technician, problemDescription, receivedItems, physicalCondition,
    estimatedCost, expectedDeliveryDate, assignedUserId, storeId,
  } = req.body;

  if (!customerName || !customerPhone || !deviceType || !brand || !model || !problemDescription || !storeId) {
    return res.status(400).json({ success: false, message: "Please fill all required fields" });
  }

  try {
    await validateStoreIsActive(storeId);

    const repair = await prisma.$transaction(async (tx) => {
      const jobNumber = await nextDocumentNumber(tx, "REPAIR_JOB", storeId, "RP");
      const receiptNumber = `RRC-${jobNumber.substring(3)}`;

      return tx.repairJob.create({
        data: {
          jobNumber,
          customerName,
          customerPhone,
          deviceType,
          brand,
          model,
          serialNumber: serialNumber || null,
          technician: technician || null,
          problemDescription,
          receivedItems: receivedItems || null,
          physicalCondition: physicalCondition || null,
          estimatedCost: estimatedCost === "" || estimatedCost === undefined ? null : Number(estimatedCost),
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
          assignedUserId: assignedUserId || null,
          storeId,
          status: "RECEIVED",
          intakeReceipt: {
            create: {
              receiptNumber,
              jobNumber,
              customerName,
              customerPhone,
              deviceType,
              brand,
              model,
              serialNumber: serialNumber || null,
              problemDescription,
              receivedItems: receivedItems || null,
              physicalCondition: physicalCondition || null,
              storeId,
            },
          },
        },
        include: { intakeReceipt: true },
      });
    });

    return res.status(201).json({ success: true, message: "Repair job and intake receipt created successfully", repair });
  } catch (error) {
    console.error("Add Repair Error:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to create repair job" });
  }
};

export const getRepairs = async (req, res) => {
  const { search, status, page = 0, limit = 20, storeId } = req.query;
  try {
    await validateStoreIsActive(storeId);
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const where = { isDeleted: false, storeId };
    if (status) where.status = status;
    if (search) {
      where.OR = ["customerName", "customerPhone", "jobNumber", "serialNumber"].map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      }));
    }

    const [repairs, total] = await Promise.all([
      prisma.repairJob.findMany({
        where,
        skip: pageNumber * pageLimit,
        take: pageLimit,
        orderBy: { createdAt: "desc" },
        include: {
          assignedUser: { select: { id: true, name: true } },
          store: { select: { storeId: true, name: true } },
          intakeReceipt: true,
          repairInvoice: { select: { repairInvoiceId: true, invoiceNumber: true, paymentStatus: true } },
        },
      }),
      prisma.repairJob.count({ where }),
    ]);

    return res.status(200).json({ success: true, repairs, total, page: pageNumber, limit: pageLimit });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching repair jobs" });
  }
};

export const getSingleRepair = async (req, res) => {
  try {
    const repair = await findRepairInStore(req.params.repairId, req.query.storeId, {
      assignedUser: { select: { id: true, name: true, email: true } },
      store: { select: { storeId: true, name: true } },
      intakeReceipt: true,
      repairParts: { include: { product: { select: { productId: true, name: true, sku: true } } }, orderBy: { createdAt: "desc" } },
      repairInvoice: { include: { payments: { orderBy: { paymentDate: "desc" } }, parts: true } },
    });
    return res.status(200).json({ success: true, repair });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching repair job" });
  }
};

export const updateRepairFromTable = async (req, res) => {
  const { repairJobId } = req.params;
  const { storeId } = req.query;
  const { col2: customerName, col3: customerPhone, col4: deviceType, col5: model, col6: serialNumber, col7: technician, col8: status, col9: estimatedCost } = req.body;
  try {
    await validateStoreIsActive(storeId);
    const repair = await findRepairInStore(repairJobId, storeId, { repairInvoice: true });
    if (repair.repairInvoice) return res.status(409).json({ success: false, message: "An invoiced repair cannot be edited" });
    if (status === "COMPLETED") return res.status(400).json({ success: false, message: "Create the repair invoice to complete this job" });

    const updatedRepair = await prisma.repairJob.update({
      where: { repairJobId },
      data: {
        customerName: customerName ?? repair.customerName,
        customerPhone: customerPhone ?? repair.customerPhone,
        deviceType: deviceType ?? repair.deviceType,
        model: model ?? repair.model,
        serialNumber: serialNumber ?? repair.serialNumber,
        technician: technician ?? repair.technician,
        status: status ?? repair.status,
        estimatedCost: estimatedCost !== undefined && estimatedCost !== "" ? Number(estimatedCost) : repair.estimatedCost,
      },
    });
    return res.status(200).json({ success: true, message: "Repair updated successfully", repair: updatedRepair });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error updating repair" });
  }
};

export const updateRepairDetailsPage = async (req, res) => {
  const { repairJobId } = req.params;
  const { storeId } = req.query;
  try {
    await validateStoreIsActive(storeId);
    const repair = await findRepairInStore(repairJobId, storeId, { repairInvoice: true });
    if (repair.repairInvoice) return res.status(409).json({ success: false, message: "An invoiced repair cannot be edited" });
    if (req.body.status === "COMPLETED") return res.status(400).json({ success: false, message: "Create the repair invoice to complete this job" });

    const labourCost = Number(req.body.labourCost || 0);
    const partsCost = repair.partsCost;
    const updatedRepair = await prisma.repairJob.update({
      where: { repairJobId },
      data: {
        technician: req.body.technician || null,
        status: req.body.status || repair.status,
        expectedDeliveryDate: req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : null,
        diagnosis: req.body.diagnosis || null,
        receivedItems: req.body.receivedItems || null,
        physicalCondition: req.body.physicalCondition || null,
        problemDescription: req.body.problemDescription || repair.problemDescription,
        initialInspectionNotes: req.body.initialInspectionNotes || null,
        estimatedCost: Number(req.body.estimatedCost || 0),
        labourCost,
        partsCost,
        totalCost: labourCost + partsCost,
      },
    });
    return res.status(200).json({ success: true, repair: updatedRepair, message: "Repair details updated successfully" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error updating repair details" });
  }
};

export const addRepairPart = async (req, res) => {
  const { repairJobId } = req.params;
  const { storeId, productId, quantity } = req.body;
  const qty = Number(quantity);

  try {
    await validateStoreIsActive(storeId);
    const repair = await findRepairInStore(repairJobId, storeId, { repairInvoice: true });
    if (repair.repairInvoice || ["COMPLETED", "CANCELLED"].includes(repair.status)) {
      return res.status(409).json({ success: false, message: "Parts cannot be changed after invoicing, completion, or cancellation" });
    }
    if (!productId || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: "Choose a product and a whole-number quantity greater than zero" });
    }

    const part = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({
        where: { productId, storeId, isDeleted: false },
        include: { product: { select: { productId: true, name: true, sku: true, retailPrice: true, isDeleted: true } } },
      });
      if (!stock || stock.product.isDeleted) throw new Error("The selected product is not available in this store");

      const deduction = await tx.stock.updateMany({
        where: { id: stock.id, quantity: { gte: qty } },
        data: { quantity: { decrement: qty } },
      });
      if (deduction.count !== 1) throw new Error(`Only ${stock.quantity} item(s) are available in stock`);

      const unitPrice = Number(stock.product.retailPrice);
      const createdPart = await tx.repairPart.create({
        data: {
          repairJobId,
          productId,
          stockId: stock.id,
          productName: stock.product.name,
          sku: stock.product.sku,
          quantity: qty,
          unitPrice,
          total: unitPrice * qty,
        },
      });

      const newPartsCost = Number(repair.partsCost) + createdPart.total;
      await tx.repairJob.update({
        where: { repairJobId },
        data: { partsCost: newPartsCost, totalCost: Number(repair.labourCost) + newPartsCost },
      });
      return createdPart;
    });

    return res.status(201).json({ success: true, message: "Part added and stock deducted", part });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to add repair part" });
  }
};

export const returnRepairPart = async (req, res) => {
  const { repairJobId, repairPartId } = req.params;
  const { storeId } = req.query;
  try {
    await validateStoreIsActive(storeId);
    const repair = await findRepairInStore(repairJobId, storeId, { repairInvoice: true });
    if (repair.repairInvoice || ["COMPLETED", "CANCELLED"].includes(repair.status)) {
      return res.status(409).json({ success: false, message: "Parts cannot be returned after invoicing, completion, or cancellation" });
    }

    await prisma.$transaction(async (tx) => {
      const part = await tx.repairPart.findFirst({ where: { repairPartId, repairJobId, status: "RESERVED" } });
      if (!part) throw new Error("Active repair part not found");
      const stock = await tx.stock.findFirst({ where: { id: part.stockId, storeId, isDeleted: false } });
      if (!stock) throw new Error("The original stock record no longer exists");

      await tx.stock.update({ where: { id: stock.id }, data: { quantity: { increment: part.quantity } } });
      await tx.repairPart.update({ where: { repairPartId }, data: { status: "RETURNED", returnedAt: new Date() } });
      const newPartsCost = Math.max(0, Number(repair.partsCost) - part.total);
      await tx.repairJob.update({ where: { repairJobId }, data: { partsCost: newPartsCost, totalCost: Number(repair.labourCost) + newPartsCost } });
    });
    return res.status(200).json({ success: true, message: "Part returned to stock" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to return repair part" });
  }
};

export const createRepairInvoice = async (req, res) => {
  const { repairJobId } = req.params;
  const { storeId } = req.query;
  const discount = Number(req.body.discount || 0);
  const paidAmount = Number(req.body.paidAmount || 0);
  const paymentMethod = req.body.paymentMethod || "cash";

  try {
    await validateStoreIsActive(storeId);
    const repair = await findRepairInStore(repairJobId, storeId, { repairInvoice: true, repairParts: { where: { status: "RESERVED" } } });
    if (repair.repairInvoice) return res.status(409).json({ success: false, message: "Repair invoice already exists" });
    if (repair.status !== "READY") return res.status(400).json({ success: false, message: "Only a READY repair can be invoiced" });

    const totalAmount = Math.max(0, Number(repair.labourCost) + Number(repair.partsCost) - discount);
    if (discount < 0 || paidAmount < 0 || paidAmount > totalAmount) return res.status(400).json({ success: false, message: "Invalid discount or payment amount" });

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await nextDocumentNumber(tx, "REPAIR_INVOICE", storeId, "RINV");
      const paymentStatus = paymentStatusFor(totalAmount, paidAmount);
      const createdInvoice = await tx.repairInvoice.create({
        data: {
          invoiceNumber, repairJobId, customerName: repair.customerName, customerPhone: repair.customerPhone,
          deviceType: repair.deviceType, brand: repair.brand, model: repair.model, serialNumber: repair.serialNumber,
          diagnosis: repair.diagnosis, labourCost: repair.labourCost, partsCost: repair.partsCost, discount,
          totalAmount, paidAmount, paymentStatus, storeId,
          parts: {
            create: repair.repairParts.map((part) => ({
              productId: part.productId,
              productName: part.productName,
              sku: part.sku,
              quantity: part.quantity,
              unitPrice: part.unitPrice,
              total: part.total,
            })),
          },
        },
        include: { parts: true },
      });
      if (repair.repairParts.length) {
        await tx.repairPart.updateMany({
          where: { repairPartId: { in: repair.repairParts.map((part) => part.repairPartId) } },
          data: { status: "INVOICED" },
        });
      }
      if (paidAmount > 0) {
        const receiptNumber = await nextDocumentNumber(tx, "PAYMENT_RECEIPT", storeId, "REC");
        await tx.payment.create({ data: { repairInvoiceId: createdInvoice.repairInvoiceId, paymentAmount: paidAmount, paymentMethod, receiptNumber, storeId } });
      }
      await tx.repairJob.update({ where: { repairJobId }, data: { status: "COMPLETED", completedAt: new Date() } });
      return createdInvoice;
    });
    return res.status(201).json({ success: true, message: "Repair invoice created and repair completed", invoice });
  } catch (error) {
    console.error("Create repair invoice error:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to create repair invoice" });
  }
};

export const addRepairInvoicePayment = async (req, res) => {
  const { repairInvoiceId } = req.params;
  const { storeId, payAmount, paymentMethod = "cash" } = req.body;
  const amount = Number(payAmount);
  try {
    await validateStoreIsActive(storeId);
    const invoice = await prisma.repairInvoice.findFirst({ where: { repairInvoiceId, storeId, status: "ISSUED" } });
    if (!invoice) return res.status(404).json({ success: false, message: "Repair invoice not found" });
    const balance = invoice.totalAmount - invoice.paidAmount;
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) return res.status(400).json({ success: false, message: "Payment must be greater than zero and no more than the outstanding balance" });

    const payment = await prisma.$transaction(async (tx) => {
      const receiptNumber = await nextDocumentNumber(tx, "PAYMENT_RECEIPT", storeId, "REC");
      const createdPayment = await tx.payment.create({ data: { repairInvoiceId, paymentAmount: amount, paymentMethod, receiptNumber, storeId } });
      const newPaidAmount = invoice.paidAmount + amount;
      await tx.repairInvoice.update({ where: { repairInvoiceId }, data: { paidAmount: newPaidAmount, paymentStatus: paymentStatusFor(invoice.totalAmount, newPaidAmount) } });
      return createdPayment;
    });
    return res.status(201).json({ success: true, message: "Repair payment recorded", payment });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to record repair payment" });
  }
};

export const deleteRepair = async (req, res) => {
  const { repairJobId } = req.params;
  try {
    await validateStoreIsActive(req.query.storeId);
    const repair = await findRepairInStore(repairJobId, req.query.storeId, { repairInvoice: true });
    if (repair.repairInvoice) return res.status(409).json({ success: false, message: "An invoiced repair cannot be deleted" });
    await prisma.repairJob.update({ where: { repairJobId }, data: { isDeleted: true } });
    return res.status(200).json({ success: true, message: "Repair job deleted successfully" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting repair job" });
  }
};
