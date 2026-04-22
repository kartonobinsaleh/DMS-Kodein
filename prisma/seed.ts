import { PrismaClient, Role, DeviceStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.student.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@dms.com",
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  // Create Staff
  const hashedStaffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.create({
    data: {
      name: "Staff User",
      email: "staff@dms.com",
      password: hashedStaffPassword,
      role: Role.STAFF,
    },
  });

  // Create Students with their Devices
  const studentNames = [
    { name: "Siti Aminah", class: "10-A" },
    { name: "Budi Santoso", class: "10-B" },
    { name: "Dewi Lestari", class: "11-A" },
    { name: "Eko Prasetyo", class: "12-C" },
    { name: "Fajar Ramadhan", class: "11-B" },
  ];

  for (const s of studentNames) {
    const student = await prisma.student.create({ data: s });
    
    // Every student has 1 Laptop
    await prisma.device.create({
      data: {
        name: `Laptop - ${student.name}`,
        type: "LAPTOP",
        status: "AVAILABLE",
        ownerId: student.id,
      },
    });

    // Every student has 1 Phone
    await prisma.device.create({
      data: {
        name: `Phone - ${student.name}`,
        type: "PHONE",
        status: "AVAILABLE",
        ownerId: student.id,
      },
    });
  }

  console.log("Seeding finished with 5 students and 10 owned devices.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
