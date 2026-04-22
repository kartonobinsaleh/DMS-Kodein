import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const patchSchema = z.object({
  dailyStatus: z.enum(["PENDING", "RETURNED_ON_TIME", "RETURNED_LATE", "VIOLATION"]).optional(),
  checkInTime: z.string().datetime().optional(),
  reason: z.string().min(5, "Reason is required for manual overrides")
});

/**
 * HARDENED Admin Patch
 * - Enforced atomic state update
 * - Strict role check
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const json = await req.json();
    const data = patchSchema.parse(json);

    // Atomic update
    const updatedLog = await prisma.dailyLog.update({
      where: { id: params.id },
      data: {
        ...(data.dailyStatus && { dailyStatus: data.dailyStatus }),
        ...(data.checkInTime && { checkInTime: new Date(data.checkInTime) }),
        reason: data.reason, // Audit trail reason
        staffId: (session.user as any).id, // Record who performed the override
      },
      include: {
        student: { select: { name: true, class: true } },
        device: { select: { name: true, type: true } }
      }
    });

    return NextResponse.json(updatedLog);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "NOT_FOUND", message: "Log record not found" }, { status: 404 });
    }
    return NextResponse.json({ 
      error: "VALIDATION_ERROR", 
      message: error.message 
    }, { status: 400 });
  }
}
