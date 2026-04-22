import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🚀 STARTING PRODUCTION SEED (CLEAN)...");

  // 1. CLEANUP
  console.log("Cleaning up old records...");
  await prisma.dailyLog.deleteMany();
  await prisma.device.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // 2. USERS (Essential Only)
  const hashedPass = bcrypt.hashSync("password123", 10);

  console.log("Creating administrative accounts...");

  // Admin Main
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@kodein.sch.id",
      password: hashedPass,
      role: "ADMIN"
    }
  });

  console.log("✅ PRODUCTION SEED SUCCESSFUL!");
  console.log("-----------------------------------");
  console.log("KREDENSIAL DEFAULT:");
  console.log("Email: admin@kodein.sch.id");
  console.log("Pass : password123");
  console.log("-----------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
