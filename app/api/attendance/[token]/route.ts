import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/attendance/[token]
 * HARDENED Public endpoint for student self-check status using statusToken
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 1. Validation: Token must not be empty
    if (!token || token.trim() === "" || token === "undefined") {
      return NextResponse.json({ 
        error: "INVALID_TOKEN", 
        message: "Status token is required" 
      }, { status: 400 });
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // 2. Database Lookup (Optimized)
    const student = await prisma.student.findUnique({
      where: { statusToken: token },
      select: {
        id: true,
        name: true,
        class: true,
        ownedDevices: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            dailyLogs: {
              where: { date: today },
              select: {
                id: true,
                dailyStatus: true,
                checkInTime: true
              }
            }
          }
        }
      }
    });

    // 3. Handle 404: Student not found
    if (!student) {
      return NextResponse.json({ 
        error: "NOT_FOUND", 
        message: "Student record not found for this secure token" 
      }, { status: 404 });
    }

    // 4. Transform Data
    const devices = student.ownedDevices.map((device: any) => {
      const log = device.dailyLogs[0] || null;
      // Using correct Enum values: ON_TIME, LATE, NOT_RETURNED
      const isReturnedOnTime = log?.dailyStatus === "ON_TIME";
      const isReturnedLate = log?.dailyStatus === "LATE";
      
      return {
        name: device.name,
        type: device.type,
        isReturned: isReturnedOnTime || isReturnedLate,
        status: log ? log.dailyStatus : "NOT_STARTED"
      };
    });

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
    console.error("[STUDENT_STATUS_API_HARDENING_ERR]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
