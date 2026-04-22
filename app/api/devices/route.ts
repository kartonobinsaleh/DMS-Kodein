import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

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

    logger.info(`Mencoba registrasi perangkat baru:`, body);

    if (body.ownerId && body.ownerId.trim() !== "") {
      const existingDevice = await prisma.device.findFirst({
        where: {
          ownerId: body.ownerId,
          type: body.type
        }
      });

      if (existingDevice) {
        logger.warn(`Registrasi DITOLAK: Siswa ${body.ownerId} sudah punya ${body.type}`, existingDevice);
        return new NextResponse(`Siswa ini sudah memiliki perangkat berjenis ${body.type} yang terdaftar.`, { status: 400 });
      }
    }

    const device = await prisma.device.create({
      data: {
        name: body.name,
        type: body.type,
        ownerId: body.ownerId || null,
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

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const json = await req.json();
    const { id, ...data } = json;

    logger.info(`Mencoba update perangkat ID: ${id}`, data);

    if (!id) {
      return new NextResponse("Missing device ID", { status: 400 });
    }

    if (data.ownerId && data.ownerId.trim() !== "") {
      const existingDevice = await prisma.device.findFirst({
        where: {
          ownerId: data.ownerId,
          type: data.type,
          NOT: {
            id: id
          }
        }
      });

      if (existingDevice) {
        logger.warn(`Update DITOLAK: Siswa ${data.ownerId} sudah punya ${data.type}`, existingDevice);
        return new NextResponse(`Siswa ini sudah memiliki perangkat berjenis ${data.type} yang terdaftar.`, { status: 400 });
      }
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        ownerId: data.ownerId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: device
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Error", { status: 500 });
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
