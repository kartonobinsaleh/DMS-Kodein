import { prisma } from "@/lib/prisma";

const LATE_LIMIT_HOUR = 17;
const LATE_LIMIT_MINUTE = 0;

export class DailyLogService {
  /**
   * Menstandarisasi pencarian tanggal hari ini (UTC Midnight)
   * Penting untuk sinkronisasi dengan kolom @db.Date Prisma
   */
  private static getTodayDate() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  /**
   * Mendapatkan objek deadline (17:00) pada hari ini
   */
  private static getDeadline() {
    const deadline = new Date();
    deadline.setHours(LATE_LIMIT_HOUR, LATE_LIMIT_MINUTE, 0, 0);
    return deadline;
  }

  static async checkOutDevice(studentId: string, deviceId: string) {
    if (!studentId || !deviceId) throw new Error("MISSING_REQUIRED_FIELDS");

    const today = this.getTodayDate();

    // 1. Validasi Keberadaan & Kepemilikan (Ownership Validation)
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true, ownerId: true }
    });

    if (!device) throw new Error("DEVICE_NOT_FOUND");
    if (device.ownerId !== studentId) throw new Error("OWNERSHIP_MISMATCH");

    // 2. Cegah Double Checkout (CRITICAL)
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        studentId_deviceId_date: {
          studentId,
          deviceId,
          date: today,
        },
      },
    });

    if (existingLog && !existingLog.checkInTime) {
      throw new Error("DEVICE_ALREADY_CHECKED_OUT");
    }

    // 3. Create DailyLog (Status: NOT_RETURNED)
    return await prisma.dailyLog.create({
      data: {
        studentId,
        deviceId,
        date: today,
        checkOutTime: new Date(),
        dailyStatus: "NOT_RETURNED",
      },
    });
  }

  static async checkInDevice(studentId: string, deviceId: string) {
    if (!studentId || !deviceId) throw new Error("MISSING_REQUIRED_FIELDS");

    const today = this.getTodayDate();
    const now = new Date();
    const deadline = this.getDeadline();

    // 1. Cari log peminjaman hari ini (Date Filtering)
    const log = await prisma.dailyLog.findUnique({
      where: {
        studentId_deviceId_date: {
          studentId,
          deviceId,
          date: today,
        },
      },
    });

    if (!log) throw new Error("NO_ACTIVE_LOG_FOR_TODAY");
    if (log.checkInTime) throw new Error("DEVICE_ALREADY_RETURNED");

    // 2. Deteksi Terlambat (Late Detection rule)
    // Jika waktu sekarang > limit 17:00
    const finalStatus = now > deadline ? "LATE" : "ON_TIME";

    // 3. Update log with Check-In Time
    return await prisma.dailyLog.update({
      where: { id: log.id },
      data: {
        checkInTime: now,
        dailyStatus: finalStatus,
      },
    });
  }

  /**
   * Mengambil daftar log dengan filter
   */
  static async getLogs(filters: { date?: string | Date; studentId?: string; status?: any }) {
    const today = this.getTodayDate();
    
    // Normalisasi tanggal harian
    let queryDate = today;
    if (filters.date) {
      const d = new Date(filters.date);
      queryDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }

    return await prisma.dailyLog.findMany({
      where: {
        date: queryDate,
        ...(filters.studentId && { studentId: filters.studentId }),
        ...(filters.status && { dailyStatus: filters.status }),
      },
      include: {
        student: { select: { name: true, class: true } },
        device: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
