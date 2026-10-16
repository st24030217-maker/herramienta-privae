import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEventEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Ingresa tu correo electrónico." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Respuesta genérica segura para no revelar cuentas existentes
      return NextResponse.json({
        success: true,
        message: "Si el correo está registrado, hemos enviado las instrucciones para restablecer tu contraseña.",
      });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://herramienta-privae.vercel.app";
    const resetUrl = `${origin}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendTransactionalEventEmail({
      userId: user.id,
      recipient: user.email,
      userName: user.name,
      eventType: "RECUPERAR_CONTRASENA",
      extraData: { resetUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Se ha generado el enlace de recuperación y enviado a tu correo.",
      resetUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al solicitar recuperación: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
