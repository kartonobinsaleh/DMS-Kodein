import { prisma } from "../lib/prisma";

async function main() {
  try {
    console.log("Cleanup starting...");
    await prisma.dailyLog.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.device.deleteMany();
    await prisma.student.deleteMany();
    console.log("Cleanup done. Creating student...");
    const s = await prisma.student.create({
      data: { name: "Siti", class: "10-A", statusToken: "token-" + Date.now() }
    });
    console.log("SUCCESS:", s.name);
  } catch (e: any) {
    console.log("ERROR MESSAGE:", e.message);
    if (e.code) console.log("ERROR CODE:", e.code);
    if (e.meta) console.log("ERROR META:", JSON.stringify(e.meta, null, 2));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
