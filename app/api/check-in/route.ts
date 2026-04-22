import { NextResponse } from "next/server";
import { DailyLogService } from "@/services/daily-log.service";

export async function POST(req: Request) {
  try {
    const { studentId, deviceId } = await req.json();
    const result = await DailyLogService.checkInDevice(studentId, deviceId);

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
