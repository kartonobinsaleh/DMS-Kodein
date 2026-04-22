import { NextResponse } from "next/server";
import { DailyLogService } from "@/services/daily-log.service";

export async function POST(req: Request) {
  try {
    const { studentId, deviceId } = await req.json();

    if (!studentId || !deviceId) {
      return NextResponse.json(
        { success: false, message: "MISSING_REQUIRED_FIELDS" },
        { status: 400 }
      );
    }

    const log = await DailyLogService.checkOutDevice(studentId, deviceId);

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
