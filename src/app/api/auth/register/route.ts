import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getPlatformConfig } from "@/lib/settings";
import { sendTransactionalEventEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-vercel-ip") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const { allowed, retryAfterSec } = rateLimit(`register:${clientIp}`, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Demasiados registros desde esta conexión. Espera ${retryAfterSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
      );
    }

    const { email, password, name, adminKey } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 100) {
      return NextResponse.json(
        { error: "El correo electrónico no tiene un formato válido" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "La contraseña es demasiado larga (máx. 128 caracteres)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const config = await getPlatformConfig();

    // Calcular 5 días de prueba gratis exactamente
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 5);

    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    let role = "USER";
    if (adminEmails.includes(normalizedEmail)) {
      const requiredKey = process.env.ADMIN_REGISTRATION_KEY;
      if (!requiredKey || adminKey === requiredKey) {
        role = "ADMIN";
      }
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        passwordHash,
        role,
        subscription: {
          create: {
            status: "TRIAL",
            trialEndsAt,
            planPrice: config.planPriceUsd,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    // Evento automático Sección 08: Alta / Inicio de prueba (5 días)
    await sendTransactionalEventEmail({
      userId: user.id,
      recipient: user.email,
      userName: user.name,
      eventType: "ALTA_INICIO_PRUEBA",
      extraData: { trialEndsAt },
    }).catch(() => {});

    const token = await createSessionToken(user.id, user.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        trialEndsAt: user.subscription?.trialEndsAt,
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
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
