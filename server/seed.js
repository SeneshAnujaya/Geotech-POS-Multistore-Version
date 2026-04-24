import { PrismaClient } from '@prisma/client';
import bcryptjs from "bcryptjs";
// scripts/seed.js

const prisma = new PrismaClient();

async function main() {
  // Generate a salt
  const salt = await bcryptjs.genSalt(10);
  // Hash the password
  const hashedPassword = await bcryptjs.hash('admin', salt);

  // Create a new user with hashed password
  await prisma.user.create({
    data: {
      email: 'geotech@gmail.com',
      password: hashedPassword,
      name: 'geotech admin',
      role: 'ADMIN',
    },
  });

  console.log('Dummy user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
