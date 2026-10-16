import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@privae.com").toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "AdminPassword2026!";
    const passwordHash = await hashPassword(defaultPassword);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        passwordHash,
      },
      create: {
        email: adminEmail,
        name: "Administrador Privae",
        passwordHash,
        role: "ADMIN",
        subscription: {
          create: {
            status: "ACTIVE",
            trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            planPrice: 0.0,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario administrador inicial preparado exitosamente.",
      email: admin.email,
      role: admin.role,
      loginUrl: "/auth/login",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al inicializar administrador: " + error.message },
      { status: 500 }
    );
  }
}
