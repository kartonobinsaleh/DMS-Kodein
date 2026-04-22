import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const [
      totalDevices,
      availableDevices,
      borrowedDevices,
      activeTransactions,
      overdueDevices,
      totalStudents,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: "AVAILABLE" } }),
      prisma.device.count({ where: { status: "BORROWED" } }),
      prisma.transaction.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.count({
        where: {
          status: "ACTIVE",
          borrowTime: { lt: twoDaysAgo },
        },
      }),
      prisma.student.count(),
    ]);

    return NextResponse.json({
      totalDevices,
      availableDevices,
      borrowedDevices,
      activeTransactions,
      overdueDevices,
      totalStudents,
    });
  } catch (_error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
