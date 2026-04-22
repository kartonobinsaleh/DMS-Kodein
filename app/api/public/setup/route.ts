import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const student = await prisma.student.findFirst({
      include: { ownedDevices: true }
    });

    if (!student) return NextResponse.json({ success: false, message: "No data" });

    // Update Student Token
    await prisma.student.update({
      where: { id: student.id },
      data: { statusToken: "token-siti" }
    });

    // Update Devices
    for (const device of student.ownedDevices) {
      const newId = device.type === "LAPTOP" ? "LAPTOP_SITI" : "PHONE_SITI";
      await prisma.device.update({
        where: { id: device.id },
        data: { id: newId }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test Data Prepared!",
      student: student.name,
      laptop: "DEVICE_LAPTOP_SITI",
      phone: "DEVICE_PHONE_SITI"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
