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

  // Create Students
  const students = [
    { name: "Siti Aminah", class: "10-A" },
    { name: "Budi Santoso", class: "10-B" },
    { name: "Dewi Lestari", class: "11-A" },
    { name: "Eko Prasetyo", class: "12-C" },
    { name: "Fajar Ramadhan", class: "11-B" },
  ];

  for (const s of students) {
    await prisma.student.create({ data: s });
  }

  // Create Devices
  const devices = [
    { name: "Chromebook 01", status: DeviceStatus.AVAILABLE },
    { name: "Chromebook 02", status: DeviceStatus.AVAILABLE },
    { name: "Laptop Dell 01", status: DeviceStatus.AVAILABLE },
    { name: "iPad Pro 01", status: DeviceStatus.AVAILABLE },
    { name: "Tablet Samsung 01", status: DeviceStatus.BORROWED },
  ];

  for (const d of devices) {
    await prisma.device.create({ data: d });
  }

  console.log("Seeding finished.");
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
