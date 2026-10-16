import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-vercel-ip") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const { allowed, retryAfterSec } = rateLimit(`login:${clientIp}`, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@privae.com").toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "AdminPassword2026!";

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true },
    });

    // Auto-creación del administrador inicial en base de datos de producción
    if (
      (!user || user.role !== "ADMIN") &&
      (normalizedEmail === adminEmail || normalizedEmail === "admin@privae.com") &&
      password === defaultPassword
    ) {
      const passwordHash = await hashPassword(defaultPassword);
      user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          role: "ADMIN",
          passwordHash,
        },
        create: {
          email: normalizedEmail,
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
        include: { subscription: true },
      });
    }

    // Dummy hash para mitigar ataques de temporización (timing attacks)
    const DUMMY_HASH = "$2a$10$wT8m9ZqFj1m7bNxV9ZqFj1m7bNxV9ZqFj1m7bNxV9ZqFj1m7bNxVe";
    const passwordHash = user ? user.passwordHash : DUMMY_HASH;
    const isValid = await verifyPassword(password, passwordHash);

    if (!user || !isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id, user.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("privae_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
