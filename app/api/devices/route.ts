import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const devices = await prisma.device.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      success: true,
      data: devices
    });
  } catch (_error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const json = await req.json();
    const body = deviceSchema.parse(json);

    const device = await prisma.device.create({
      data: {
        name: body.name,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      data: device
    });
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
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing device ID", { status: 400 });
    }

    await prisma.device.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return new NextResponse("Perangkat tidak dapat dihapus karena memiliki riwayat operasional aktif.", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
