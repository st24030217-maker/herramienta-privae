import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET no está definido. Defínelo en las variables de entorno para producción."
    );
  }
  return new TextEncoder().encode("privae_dev_insecure_secret_change_me");
}

const TOKEN_COOKIE = "privae_auth_token";

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription: {
    status: string;
    trialEndsAt: string;
    gracePeriodEndsAt: string | null;
    isAccessGranted: boolean;
    daysRemaining: number;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
    return await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return (verified.payload.sub as string) || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;

    if (!token) return null;

    const userId = await verifySessionToken(token);
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) return null;

    // Calcular estado de acceso
    let subscription = user.subscription;
    
    // Si no tiene suscripción creada (caso borde), le creamos su trial de 5 días
    if (!subscription) {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 5);
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          status: "TRIAL",
          trialEndsAt: trialEnds,
        },
      });
    }

    const now = new Date();
    let isAccessGranted = false;
    let daysRemaining = 0;

    if (user.role === "ADMIN") {
      isAccessGranted = true;
      daysRemaining = 999;
    } else if (subscription.status === "ACTIVE") {
      isAccessGranted = true;
      if (subscription.currentPeriodEnd) {
        daysRemaining = Math.max(
          0,
          Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      }
    } else if (subscription.status === "TRIAL") {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (now <= trialEnd) {
        isAccessGranted = true;
        daysRemaining = Math.max(
          0,
          Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      } else {
        // El trial venció
        isAccessGranted = false;
        daysRemaining = 0;
      }
    } else if (subscription.status === "GRACE_PERIOD" && subscription.gracePeriodEndsAt) {
      const graceEnd = new Date(subscription.gracePeriodEndsAt);
      if (now <= graceEnd) {
        isAccessGranted = true; // Durante los 3 días de gracia tiene acceso con aviso
        daysRemaining = Math.max(
          0,
          Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: {
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt.toISOString(),
        gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString() || null,
        isAccessGranted,
        daysRemaining,
      },
    };
  } catch {
    return null;
  }
}
