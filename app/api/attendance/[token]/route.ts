import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/attendance/[token]
 * SECURE Public endpoint for student self-check status using statusToken
 */
export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const student = await prisma.student.findUnique({
      where: { statusToken: params.token }, // Search by Secure Token
      include: {
        ownedDevices: {
          include: {
            dailyLogs: {
              where: { date: today }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "STUDENT_NOT_FOUND" }, { status: 404 });
    }

    // Format devices
    const devices = student.ownedDevices.map(device => {
      const log = device.dailyLogs[0] || null;
      return {
        id: device.id,
        name: device.name,
        type: device.type,
        isReturned: log ? (log.dailyStatus !== "PENDING" && log.checkInTime !== null) : false,
        status: log ? log.dailyStatus : "NOT_STARTED"
      };
    });

    // Check if there was any activity today
    const hasActivity = devices.some(d => d.status !== "NOT_STARTED");

    const allReturned = devices.length > 0 && devices.every(d => d.isReturned);
    const overallStatus = allReturned ? "RETURNED" : (hasActivity ? "NOT_SAFE" : "NO_ACTIVITY");

    return NextResponse.json({
      name: student.name,
      class: student.class,
      overallStatus,
      devices,
      hasActivity,
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
