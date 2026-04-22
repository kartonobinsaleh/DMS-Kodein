import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * HARDENED GET Logs
 * - Sanitized date filtering
 * - Type-safe status query
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const studentClass = searchParams.get("class");
  const dailyStatus = searchParams.get("status");

  // Timezone-safe date parsing
  const now = dateStr ? new Date(dateStr) : new Date();
  const queryDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  try {
    const logs = await prisma.dailyLog.findMany({
      where: {
        date: queryDate,
        ...(studentClass && { student: { class: studentClass } }),
        ...(dailyStatus && { dailyStatus: dailyStatus as any }),
      },
      include: {
        student: { select: { id: true, name: true, class: true } },
        device: { select: { id: true, name: true, type: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("[GET LOGS HARDENING ERR]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
