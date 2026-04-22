import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Checking DB connection...");
    await prisma.$connect();
    console.log("Connected! Creating student...");
    await prisma.student.create({
      data: { name: "Test", class: "A", statusToken: "tmp-" + Date.now() }
    });
    console.log("Success!");
  } catch (e: any) {
    console.log("---- RAW ERROR ----");
    console.log(JSON.stringify(e, null, 2));
    if (e.cause) {
       console.log("---- ERROR CAUSE ----");
       console.log(JSON.stringify(e.cause, null, 2));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
