import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Operación no permitida: El administrador ya se encuentra inicializado en el sistema." },
        { status: 403 }
      );
    }

    const setupKey = req.nextUrl.searchParams.get("key");
    const requiredKey = process.env.SETUP_SECRET_KEY;
    if (requiredKey && setupKey !== requiredKey) {
      return NextResponse.json(
        { error: "No autorizado: Clave de inicialización inválida." },
        { status: 401 }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@privae.com").toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "AdminPassword2026!";
    const passwordHash = await hashPassword(defaultPassword);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador Privae",
        passwordHash,
        role: "ADMIN",
        isActive: true,
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
