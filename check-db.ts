import { prisma } from "./lib/prisma";

async function check() {
  try {
    const userCount = await prisma.user.count();
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@dms.com" }
    });
    
    console.log("----------------------------");
    console.log("DB Status:");
    console.log("Total Users:", userCount);
    console.log("Admin exists:", !!adminUser);
    if (adminUser) {
      console.log("Admin Email:", adminUser.email);
      console.log("Admin Role:", adminUser.role);
    }
    console.log("----------------------------");
  } catch (err) {
    console.error("DB Check Failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
