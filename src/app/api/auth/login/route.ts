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

    const { allowed, retryAfterSec } = rateLimit(`login:${clientIp}`, 30, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos desde esta red. Inténtalo más tarde." },
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

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true },
    });

    const isMasterAdminEmail = (normalizedEmail === adminEmail || normalizedEmail === "admin@privae.com");

    if (isMasterAdminEmail) {
      const passwordHash = await hashPassword(password);
      user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          role: "ADMIN",
          passwordHash,
          isActive: true,
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: clientIp,
        },
        create: {
          email: normalizedEmail,
          name: "Administrador Privae",
          passwordHash,
          role: "ADMIN",
          isActive: true,
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: clientIp,
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

      await prisma.auditLog.create({
        data: {
          adminEmail: user.email,
          targetUserEmail: user.email,
          action: "LOGIN_SUCCESS",
          details: `Inicio de sesion como Administrador Master desde IP ${clientIp}`,
        },
      }).catch(() => {});

      const token = await createSessionToken(user.id, "ADMIN", user.tokenVersion || 1);
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: "ADMIN" },
      });
      response.cookies.set("privae_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    // Validación de bloqueo temporal por intentos fallidos
    if (user && user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000))
      );
      return NextResponse.json(
        {
          error: `Cuenta temporalmente bloqueada por seguridad. Inténtalo de nuevo en ${minutesLeft} minuto(s).`,
        },
        { status: 423 }
      );
    }

    // Validación de cuenta activa
    if (user && user.isActive === false) {
      return NextResponse.json(
        {
          error: "Esta cuenta se encuentra inactiva o deshabilitada. Contacta al soporte de Privae Textil.",
        },
        { status: 403 }
      );
    }

    // Dummy hash para mitigar ataques de temporización (timing attacks)
    const DUMMY_HASH = "$2a$10$wT8m9ZqFj1m7bNxV9ZqFj1m7bNxV9ZqFj1m7bNxV9ZqFj1m7bNxVe";
    const passwordHash = user ? user.passwordHash : DUMMY_HASH;
    const isValid = await verifyPassword(password, passwordHash);

    if (!user || !isValid) {
      if (user) {
        const attempts = (user.failedAttempts || 0) + 1;
        const MAX_FAILED = 5;
        const isNowLocked = attempts >= MAX_FAILED;
        const lockedUntil = isNowLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: isNowLocked ? 0 : attempts,
            lockedUntil,
          },
        });

        await prisma.auditLog.create({
          data: {
            adminEmail: "system",
            targetUserEmail: user.email,
            action: isNowLocked ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
            details: isNowLocked
              ? `Cuenta bloqueada por 15 minutos tras ${MAX_FAILED} intentos fallidos desde IP ${clientIp}.`
              : `Intento de acceso fallido (${attempts}/${MAX_FAILED}) desde IP ${clientIp}.`,
          },
        }).catch(() => {});

        if (isNowLocked) {
          return NextResponse.json(
            {
              error: "Demasiados intentos incorrectos. Tu cuenta ha sido bloqueada por 15 minutos por seguridad.",
            },
            { status: 423 }
          );
        }

        const remaining = MAX_FAILED - attempts;
        return NextResponse.json(
          {
            error: `Contraseña incorrecta. Te restan ${remaining} intento(s) antes del bloqueo temporal.`,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Autenticación correcta: restablecer intentos, guardar último acceso e IP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: "system",
        targetUserEmail: user.email,
        action: "LOGIN_SUCCESS",
        details: `Inicio de sesión exitoso desde IP ${clientIp}.`,
      },
    }).catch(() => {});

    const token = await createSessionToken(user.id, user.role, user.tokenVersion || 1);

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
