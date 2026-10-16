import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para restablecer la contraseña." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== token ||
      !user.resetTokenExpiry ||
      new Date() > new Date(user.resetTokenExpiry)
    ) {
      return NextResponse.json(
        { error: "El enlace de recuperación es inválido o ha expirado." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar contraseña: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
