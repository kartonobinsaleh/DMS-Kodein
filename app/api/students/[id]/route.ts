import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import z from "zod";

const updateSchema = z.object({
  name: z.string().min(2),
  class: z.string().min(2),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const { id } = await params;
    const json = await req.json();
    const body = updateSchema.parse(json);

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: body.name,
        class: body.class,
      },
    });

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    if (error instanceof z.ZodError) return new NextResponse(error.message, { status: 400 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
