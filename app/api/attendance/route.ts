import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/attendance
 * Khusus untuk Staff View: Mengambil daftar siswa, perangkat mereka, 
 * dan status log harian hari ini.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentClass = searchParams.get("class");

  // Normalisasi tanggal untuk pencarian log hari ini (UTC)
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  try {
    const students = await prisma.student.findMany({
      where: {
        ...(studentClass && { class: studentClass }),
      },
      include: {
        ownedDevices: {
          include: {
            dailyLogs: {
              where: {
                date: today
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    // Formatting data agar mudah dikonsumsi frontend
    const formattedData = students.map(student => {
      const devices = student.ownedDevices.map(device => {
        const todayLog = device.dailyLogs[0] || null;
        return {
          id: device.id,
          name: device.name,
          type: device.type,
          status: device.status, // Current physical status
          todayLog: todayLog ? {
            id: todayLog.id,
            dailyStatus: todayLog.dailyStatus,
            checkOutTime: todayLog.checkOutTime,
            checkInTime: todayLog.checkInTime
          } : null
        };
      });

      return {
        id: student.id,
        name: student.name,
        class: student.class,
        devices
      };
    });

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("[ATTENDANCE_API_ERR]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
