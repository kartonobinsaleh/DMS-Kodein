import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SYSTEM_CONFIG } from "@/lib/config";
import * as z from "zod";

const checkInSchema = z.object({
  studentId: z.string(),
  deviceId: z.string(),
});

/**
 * HARDENED Check-In Handler
 * - Atomic lifecycle state check
 * - Timezone-safe daily matching
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const json = await req.json();
    const { studentId, deviceId } = checkInSchema.parse(json);
    
    const now = new Date();
    // Match the same UTC normalization used in Check-Out
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Atomic lookup for the PENDING record
      const existingLog = await tx.dailyLog.findUnique({
        where: {
          studentId_deviceId_date: { studentId, deviceId, date: today }
        }
      });

      if (!existingLog || existingLog.dailyStatus !== "PENDING") {
        throw new Error("INVALID_STATE");
      }

      // 2. Business Logic: Late Check (Using centralized config)
      const isLate = now.getHours() >= SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;

      // 3. Atomic Updates
      const updatedLog = await tx.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          checkInTime: now,
          dailyStatus: isLate ? "RETURNED_LATE" : "RETURNED_ON_TIME",
          staffId: (session.user as any).id, // Audit trail
        },
        include: {
          student: { select: { name: true, class: true } },
          device: { select: { name: true, type: true } }
        }
      });

      await tx.device.update({
        where: { id: deviceId },
        data: { status: "AVAILABLE" }
      });

      return updatedLog;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "INVALID_STATE") {
      return NextResponse.json({ 
        error: "NOT_FOUND", 
        message: "No active PENDING log found for this device today" 
      }, { status: 404 });
    }
    
    console.error("[CHECK-IN HARDENING ERR]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
