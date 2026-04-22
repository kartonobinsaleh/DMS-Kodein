import { NextResponse } from "next/server";
import { DailyLogService } from "@/services/daily-log.service";

export async function GET(req: Request) {
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
