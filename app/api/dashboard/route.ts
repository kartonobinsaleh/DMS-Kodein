import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkIfOverdue } from "@/lib/business-logic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [
      totalDevices,
      availableDevices,
      borrowedDevices,
      activeTransactions,
      totalStudents,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: "AVAILABLE" } }),
      prisma.device.count({ where: { status: "BORROWED" } }),
      prisma.transaction.findMany({ where: { status: "ACTIVE" } }),
      prisma.student.count(),
    ]);

    const overdueDevices = activeTransactions.filter(tx => 
      checkIfOverdue(tx.borrowTime, tx.status)
    ).length;

    return NextResponse.json({
      totalDevices,
      availableDevices,
      borrowedDevices,
      activeTransactions: activeTransactions.length,
      overdueDevices,
      totalStudents,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
