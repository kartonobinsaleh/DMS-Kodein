import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🚀 STARTING PRODUCTION-READY SEED...");
  
  // 1. CLEANUP
  console.log("Cleaning up old records...");
  await prisma.dailyLog.deleteMany();
  await prisma.device.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // 2. USERS (Audit Trails)
  const hashedPass = "$2a$10$8.N67BgM.K.9G8BgM.K.9Oe8BgM.K.9G8BgM.K.9G8BgM.K.9G8"; 
  const admin = await prisma.user.create({
    data: { name: "System Admin", email: "admin@dms.com", password: hashedPass, role: "ADMIN" }
  });
  const staff = await prisma.user.create({
    data: { name: "Operator Office", email: "staff@dms.com", password: hashedPass, role: "STAFF" }
  });

  // 3. STUDENTS & DEVICES
  console.log("Seeding operational data...");
  const students = [
    { name: "Siti Aminah", class: "10-A", token: "token-siti" },
    { name: "Budi Santoso", class: "10-B", token: "token-budi" },
    { name: "Dewi Lestari", class: "11-A", token: "token-dewi" },
  ];

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (const s of students) {
    const student = await prisma.student.create({
      data: { name: s.name, class: s.class, statusToken: s.token }
    });

    // Laptop (Borrowed)
    const laptop = await prisma.device.create({
      data: {
        name: `Laptop ${s.name}`,
        type: "LAPTOP",
        status: "BORROWED",
        ownerId: student.id
      }
    });

    // Handle Log
    await prisma.dailyLog.create({
      data: {
        studentId: student.id,
        deviceId: laptop.id,
        date: today,
        dailyStatus: "NOT_RETURNED",
        checkOutTime: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        staffId: staff.id
      }
    });
    
    // Available Phone
    await prisma.device.create({
      data: {
        name: `Phone ${s.name}`,
        type: "PHONE",
        status: "AVAILABLE",
        ownerId: student.id
      }
    });
  }

  console.log("✅ PRODUCTION SEED SUCCESSFUL!");
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
