import { NextResponse } from "next/server";
import { DailyLogService } from "@/services/daily-log.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    
    const result = await DailyLogService.getLogs({
      date: searchParams.get("date") || undefined,
      studentId: searchParams.get("studentId") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
