const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  console.log("CONSTRUCTOR FIX TEST START");
  try {
    const student = await prisma.student.findFirst();
    console.log("Found student:", student ? student.name : "None");
    console.log("CONSTRUCTOR FIX TEST SUCCESS");
  } catch (e) {
    console.error("CONSTRUCTOR FIX TEST ERROR", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
