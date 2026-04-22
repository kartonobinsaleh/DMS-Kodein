import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { returnSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const body = returnSchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if transaction exists and is active
      const transaction = await tx.transaction.findUnique({
        where: { id: body.transactionId },
      });

      if (!transaction) throw new Error("Transaction not found");
      if (transaction.status === "COMPLETED") {
        throw new Error("Device already returned");
      }

      // 2. Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: body.transactionId },
        data: {
          status: "COMPLETED",
          returnTime: new Date(),
          condition: body.condition,
        },
      });

      // 3. Update device status
      await tx.device.update({
        where: { id: transaction.deviceId },
        data: { status: "AVAILABLE" },
      });

      return updatedTransaction;
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
