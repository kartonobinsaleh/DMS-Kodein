import { NextResponse } from "next/server";
import { DailyLogService } from "@/services/daily-log.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const studentId = searchParams.get("studentId") || undefined;
    const status = searchParams.get("status") || undefined;

    // Normalisasi tanggal jika ada
    let date: Date | undefined = undefined;
    if (dateParam) {
      const d = new Date(dateParam);
      date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }

    const logs = await DailyLogService.getLogs({
      date,
      studentId,
      status,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
