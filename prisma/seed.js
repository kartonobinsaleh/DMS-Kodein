const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const HASHED_PASSWORD = "$2a$10$8.N67BgM.K.9G8BgM.K.9Oe8BgM.K.9G8BgM.K.9G8BgM.K.9G8"; 

async function main() {
  console.log("🚀 Starting JS Seeding...");

  await prisma.dailyLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.device.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@dms.com",
      password: HASHED_PASSWORD,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff",
      email: "staff@dms.com",
      password: HASHED_PASSWORD,
      role: "STAFF",
    },
  });

  const students = [
    { name: "Siti Aminah", class: "10-A", statusToken: "siti-token" },
    { name: "Budi Santoso", class: "10-B", statusToken: "budi-token" },
  ];

  for (const s of students) {
    const student = await prisma.student.create({ data: s });
    
    await prisma.device.create({
      data: {
        name: `Laptop ${s.name}`,
        type: "LAPTOP",
        status: "BORROWED",
        ownerId: student.id,
      },
    });
  }

  console.log("✅ JS Seeding Finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
