import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const students = await prisma.student.findMany({
      orderBy: { name: "asc" },
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
      }
    });

    return NextResponse.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error("GET Students API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const body = studentSchema.parse(json);

    const student = await prisma.student.create({
      data: {
        name: body.name,
        class: body.class,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing student ID", { status: 400 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return new NextResponse("Siswa tidak dapat dihapus karena memiliki riwayat operasional aktif.", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
