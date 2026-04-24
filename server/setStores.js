import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// const updateUserStoreId = async () => {
//     const userId = '68179069feb1d6e838a4a4a8';
//     const storeId = '681b89292eedc40883a860fa';
//     try {
//          const updateUser = await prisma.user.update({
//         where: {id: userId},
//         data: {storeId: storeId}
//     }) 

//     console.log('users storeId updated success');
    
//     } catch (error) {
//         console.log(error);
        
//     }
  

// }

// updateUserStoreId();


// const updateAllProductsWithStoreId = async () => {
//   const storeId = '681b89002eedc40883a860f9'; // Your target store ID

//   try {
//     const result = await prisma.product.updateMany({
//       data: {
//         storeId: storeId,
//       },
//     });

//     console.log(`✅ Updated ${result.count} products with storeId ${storeId}`);
//   } catch (error) {
//     console.error('❌ Error updating products:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// updateAllProductsWithStoreId();

// const products = await prisma.product.findMany();

// for (const p of products) {
//   await prisma.stock.create({
//     data: {
//       productId: p.productId,
//       storeId: "681b89002eedc40883a860f9",
//       quantity: p.quantity,
//     }
//   });
// }


// async function main() {
//   const STORE_ID = "69e3eb9297bf66943d4dc297";

//   const users = await prisma.user.findMany();

//   console.log(`Found ${users.length} users to update`);

//   for (const user of users) {
//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         storeId: STORE_ID
//       }
//     });
//   }

//   console.log("✅ Users updated successfully");
// }

// main()
//   .catch(e => console.error(e))
//   .finally(async () => await prisma.$disconnect());

const STORE_ID = "69e3eb9297bf66943d4dc297";

// async function fixSales() {
//   const sales = await prisma.sale.findMany();

//   for (const sale of sales) {
//     await prisma.sale.update({
//       where: { saleId: sale.saleId },
//       data: {
//         storeId: STORE_ID
//       }
//     });
//   }

//   console.log("✅ Sales updated");
// }

// fixSales();

// const STORE_ID = "69e3eb9297bf66943d4dc297";

// async function createStockFromProducts() {
//   try {
//     // 1. Get all active products
//     const products = await prisma.product.findMany({
//       where: {
//         isDeleted: false
//       }
//     });

//     console.log(`Found ${products.length} products`);

//     // for (const product of products) {
//     //   console.log(`Product: ${product.name}, Quantity: ${product.quantity}`);
//     // }

//     // 2. Loop and create stock
//     for (const product of products) {
//       await prisma.stock.upsert({
//         where: {
//           productId_storeId: {
//             productId: product.productId,
//             storeId: STORE_ID
//           }
//         },
//         update: {
//           // optional: if already exists, you can sync quantity
//           quantity: product.quantity || 0
//         },
//         create: {
//           productId: product.productId,
//           storeId: STORE_ID,
//           quantity: product.quantity || 0,
//           isDeleted: false
//         }
//       });
//     }

//     console.log("✅ Stock creation completed");
//   } catch (err) {
//     console.error("❌ Error creating stock:", err);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// createStockFromProducts();