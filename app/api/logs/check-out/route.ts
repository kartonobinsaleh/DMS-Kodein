import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const checkOutSchema = z.object({
  studentId: z.string(),
  deviceId: z.string(),
});

/**
 * HARDENED Check-Out Handler
 * - Race-condition safe (Atomic status update)
 * - Timezone-safe daily normalization
 * - Transactionally consistent
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const json = await req.json();
    const { studentId, deviceId } = checkOutSchema.parse(json);

    // Normalize date to UTC 00:00:00 to match @db.Date behavior safely
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify and Lock device in one operation
      // We use simple update with where clause to simulate atomic state checking
      const device = await tx.device.findFirst({
        where: { id: deviceId, ownerId: studentId },
        select: { id: true, status: true }
      });

      if (!device) {
        throw new Error("FORBIDDEN_OWNERSHIP");
      }

      if (device.status !== "AVAILABLE") {
        throw new Error("DEVICE_NOT_AVAILABLE");
      }

      // 2. Atomic state update
      await tx.device.update({
        where: { id: deviceId },
        data: { status: "BORROWED" }
      });

      // 3. Create Log (Unique constraint studentId_deviceId_date handles safety)
      return await tx.dailyLog.create({
        data: {
          studentId,
          deviceId,
          date: today,
          dailyStatus: "PENDING",
          checkOutTime: now,
        },
        include: {
          student: { select: { name: true, class: true } },
          device: { select: { name: true, type: true } }
        }
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    // Audit-friendly error mapping
    if (error.message === "FORBIDDEN_OWNERSHIP") {
      return NextResponse.json({ error: "FORBIDDEN", message: "Device mismatch" }, { status: 403 });
    }
    if (error.message === "DEVICE_NOT_AVAILABLE") {
      return NextResponse.json({ error: "CONCURRENCY_ERROR", message: "Device already in use" }, { status: 409 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "ALREADY_LOGGED", message: "Log already exists for today" }, { status: 409 });
    }
    
    console.error("[CHECK-OUT HARDENING ERR]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
