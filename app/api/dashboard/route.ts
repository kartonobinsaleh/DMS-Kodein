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
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const [
      totalDevices,
      availableDevices,
      borrowedDevices,
      totalStudents,
      notReturnedToday,
      lateToday,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: "AVAILABLE" } }),
      prisma.device.count({ where: { status: "BORROWED" } }),
      prisma.student.count(),
      prisma.dailyLog.count({ 
        where: { date: today, checkInTime: null } 
      }),
      prisma.dailyLog.count({ 
        where: { date: today, dailyStatus: "LATE" } 
      }),
    ]);

    return NextResponse.json({
      totalDevices,
      availableDevices,
      borrowedDevices,
      totalStudents,
      activeTransactions: notReturnedToday, // Aliased for frontend compatibility if needed
      overdueDevices: lateToday, // Aliased for frontend compatibility if needed
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
