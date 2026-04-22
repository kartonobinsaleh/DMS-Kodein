import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import z from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const { id } = await params;
    const json = await req.json();
    const body = updateUserSchema.parse(json);

    // Prepare update data
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // Only update password if provided and not empty
    if (body.password && body.password.length >= 6) {
      updateData.password = bcrypt.hashSync(body.password, 10);
    }

    // Prevent self-deactivation or self-role change to avoid lockout
    if (id === (session.user as any).id) {
       if (updateData.isActive === false) return new NextResponse("Tidak dapat menonaktifkan akun sendiri", { status: 400 });
       if (updateData.role === "STAFF") return new NextResponse("Tidak dapat menurunkan pangkat admin sendiri", { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error instanceof z.ZodError) return new NextResponse(error.message, { status: 400 });
    // Catch unique constraint if email duplicated
    if (error.code === 'P2002') return new NextResponse("Email sudah digunakan", { status: 400 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden: Admins Only", { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Prevent self wipe
    if (id === (session.user as any).id) {
       return new NextResponse("Tidak dapat menghapus akun sendiri", { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return new NextResponse("Pengguna tidak dapat dihapus karena memiliki rekam medis riwayat operasional (Daily Logs). Silakan nonaktifkan (Deactivate) akun saja.", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
