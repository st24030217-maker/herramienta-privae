import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { sendTransactionalEventEmail } from "./email";
import { getPlatformConfig } from "./settings";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "privae_master_jwt_secret_key_dtf_prepress_2026_prod_fallback_auth";
  return new TextEncoder().encode(secret);
}

const TOKEN_COOKIE = "privae_auth_token";

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: {
    status: string;
    trialEndsAt: string;
    gracePeriodEndsAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    planPrice: number;
    paymentMethodBrand: string | null;
    paymentMethodLast4: string | null;
    stripeSubscriptionId: string | null;
    isAccessGranted: boolean;
    daysRemaining: number;
  };
  payments?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    invoiceUrl: string | null;
    failureReason: string | null;
    createdAt: string;
  }>;
  emailLogs?: Array<{
    id: string;
    eventType: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string, role: string = "USER"): Promise<string> {
  return await new SignJWT({ sub: userId, role })
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
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;

    if (!token) return null;

    const userId = await verifySessionToken(token);
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        emailLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return null;

    const config = await getPlatformConfig();
    let subscription = user.subscription;

    if (!subscription) {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 5);
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          status: "TRIAL",
          trialEndsAt: trialEnds,
          planPrice: config.planPriceUsd,
        },
      });
    }

    const now = new Date();
    let isAccessGranted = false;
    let daysRemaining = 0;

    // Verificar transiciones automáticas en tiempo real si venció la prueba o el periodo de gracia
    if (subscription.status === "TRIAL") {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (now <= trialEnd) {
        isAccessGranted = true;
        daysRemaining = Math.max(
          0,
          Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      } else {
        isAccessGranted = false;
        daysRemaining = 0;
        if (!subscription.trialExpiredNoticeSent) {
          subscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: { trialExpiredNoticeSent: true },
          });
          await sendTransactionalEventEmail({
            userId: user.id,
            recipient: user.email,
            userName: user.name,
            eventType: "FIN_DE_PRUEBA",
            extraData: { trialEndsAt: subscription.trialEndsAt },
          }).catch(() => {});
        }
      }
    } else if (subscription.status === "GRACE_PERIOD" && subscription.gracePeriodEndsAt) {
      const graceEnd = new Date(subscription.gracePeriodEndsAt);
      if (now <= graceEnd) {
        isAccessGranted = true; // Durante los 3 días naturales de gracia conserva acceso con aviso
        daysRemaining = Math.max(
          0,
          Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      } else {
        // Al terminar los 3 días de gracia sin pago, suspender suscripción y bloquear herramientas
        isAccessGranted = false;
        daysRemaining = 0;
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "SUSPENDED",
            graceExpiredNoticeSent: true,
          },
        });
        if (!subscription.graceExpiredNoticeSent) {
          await sendTransactionalEventEmail({
            userId: user.id,
            recipient: user.email,
            userName: user.name,
            eventType: "FIN_PERIODO_GRACIA",
            extraData: { gracePeriodEndsAt: graceEnd },
          }).catch(() => {});
        }
      }
    } else if (subscription.status === "ACTIVE") {
      isAccessGranted = true;
      if (subscription.currentPeriodEnd) {
        const periodEnd = new Date(subscription.currentPeriodEnd);
        daysRemaining = Math.max(
          0,
          Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        // Recordatorio automático 3 días antes de renovación
        if (
          !subscription.cancelAtPeriodEnd &&
          daysRemaining > 0 &&
          daysRemaining <= 3
        ) {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (
            !subscription.lastReminderSentAt ||
            new Date(subscription.lastReminderSentAt) < sevenDaysAgo
          ) {
            subscription = await prisma.subscription.update({
              where: { id: subscription.id },
              data: { lastReminderSentAt: now },
            });
            await sendTransactionalEventEmail({
              userId: user.id,
              recipient: user.email,
              userName: user.name,
              eventType: "RECORDATORIO_3_DIAS",
              extraData: { currentPeriodEnd: periodEnd },
            }).catch(() => {});
          }
        }
      } else {
        daysRemaining = 30;
      }
    }

    if (user.role === "ADMIN") {
      isAccessGranted = true;
      daysRemaining = 999;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      subscription: {
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt.toISOString(),
        gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString() || null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        planPrice: config.planPriceUsd || subscription.planPrice,
        paymentMethodBrand: subscription.paymentMethodBrand || null,
        paymentMethodLast4: subscription.paymentMethodLast4 || null,
        stripeSubscriptionId: subscription.stripeSubscriptionId || null,
        isAccessGranted,
        daysRemaining,
      },
      payments: user.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        invoiceUrl: p.invoiceUrl,
        failureReason: p.failureReason,
        createdAt: p.createdAt.toISOString(),
      })),
      emailLogs: user.emailLogs.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        subject: e.subject,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}
