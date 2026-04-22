import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { borrowSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const body = borrowSchema.parse(json);

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check student
      const student = await tx.student.findUnique({
        where: { id: body.studentId },
      });
      if (!student) throw new Error("Student not found");

      // 2. Check device availability
      const device = await tx.device.findUnique({
        where: { id: body.deviceId },
      });
      if (!device) throw new Error("Device not found");
      if (device.status !== "AVAILABLE") {
        throw new Error("Device is already borrowed or under maintenance");
      }

      // 3. Create transaction log
      const transaction = await tx.transaction.create({
        data: {
          studentId: body.studentId,
          deviceId: body.deviceId,
          borrowTime: new Date(),
          status: "ACTIVE",
        },
      });

      // 4. Update device status
      await tx.device.update({
        where: { id: body.deviceId },
        data: { status: "BORROWED" },
      });

      return transaction;
    });

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(message, { status: 400 });
  }
}
