import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateStoreIsActive = async (storeId) => {
  const store = await prisma.store.findUnique({ where: { storeId } });

  if (!store || store.isDeleted || store.status !== "ACTIVE") {
    const err = new Error("Store is not available or active");
    err.statusCode = 400;
    throw err;
  }

  return store;
};
