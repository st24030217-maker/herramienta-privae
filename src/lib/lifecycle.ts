import { prisma } from "./prisma";
import { sendTransactionalEventEmail } from "./email";
import { getPlatformConfig } from "./settings";

/**
 * Evalúa y ejecuta las reglas automáticas del ciclo de vida de suscripción y retención (Secciones 02, 07 y 08 del PDF):
 * 1. Fin de prueba gratuita (5 días): bloquea acceso y envía aviso FIN_DE_PRUEBA.
 * 2. Recordatorio 3 días antes de la fecha de renovación/vencimiento (RECORDATORIO_3_DIAS).
 * 3. Fin de los 3 días naturales de gracia: suspende suscripción sin borrar cuenta y envía FIN_PERIODO_GRACIA.
 * 4. Política de eliminación automática de originales/temporales y tokens vencidos según FILE_RETENTION_MINUTES.
 */
export async function runSubscriptionLifecycleChecks() {
  const now = new Date();
  let trialsExpired = 0;
  let remindersSent = 0;
  let gracePeriodsExpired = 0;
  let expiredTokensPurged = 0;
  let anonymizedFileLogs = 0;

  try {
    // 1. Verificar pruebas de 5 días vencidas
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: "TRIAL",
        trialEndsAt: { lt: now },
        trialExpiredNoticeSent: false,
      },
      include: { user: true },
    });

    for (const sub of expiredTrials) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: "PAST_DUE",
          trialExpiredNoticeSent: true,
        },
      });

      if (sub.user?.email) {
        await sendTransactionalEventEmail({
          userId: sub.userId,
          recipient: sub.user.email,
          userName: sub.user.name,
          eventType: "FIN_DE_PRUEBA",
          extraData: { trialEndsAt: sub.trialEndsAt },
        });
      }
      trialsExpired++;
    }

    // 2. Verificar recordatorios 3 días antes de renovación/vencimiento
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const upcomingRenewals = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: {
          gt: now,
          lte: threeDaysFromNow,
        },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lt: sevenDaysAgo } },
        ],
      },
      include: { user: true },
    });

    for (const sub of upcomingRenewals) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastReminderSentAt: now },
      });

      if (sub.user?.email) {
        await sendTransactionalEventEmail({
          userId: sub.userId,
          recipient: sub.user.email,
          userName: sub.user.name,
          eventType: "RECORDATORIO_3_DIAS",
          extraData: { currentPeriodEnd: sub.currentPeriodEnd || undefined },
        });
      }
      remindersSent++;
    }

    // 3. Verificar fin del periodo de gracia de 3 días naturales
    const expiredGraces = await prisma.subscription.findMany({
      where: {
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: { lt: now },
      },
      include: { user: true },
    });

    for (const sub of expiredGraces) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: "SUSPENDED",
          graceExpiredNoticeSent: true,
        },
      });

      if (sub.user?.email) {
        await sendTransactionalEventEmail({
          userId: sub.userId,
          recipient: sub.user.email,
          userName: sub.user.name,
          eventType: "FIN_PERIODO_GRACIA",
          extraData: { gracePeriodEndsAt: sub.gracePeriodEndsAt || undefined },
        });
      }
      gracePeriodsExpired++;
    }

    // 4. Purga automática conforme a FILE_RETENTION_MINUTES (Sección 07 punto 5)
    const config = await getPlatformConfig();
    const retentionCutoff = new Date(
      now.getTime() - config.fileRetentionMinutes * 60 * 1000
    );

    const purgedTokens = await prisma.user.updateMany({
      where: {
        resetTokenExpiry: { lt: now },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    expiredTokensPurged = purgedTokens.count;

    const purgedFileRefs = await prisma.toolUsage.updateMany({
      where: {
        createdAt: { lt: retentionCutoff },
        NOT: { inputName: "[PURGADO AUTOMÁTICAMENTE]" },
      },
      data: {
        inputName: "[PURGADO AUTOMÁTICAMENTE]",
      },
    });
    anonymizedFileLogs = purgedFileRefs.count;
  } catch (err) {
    console.error("Error ejecutando ciclo de vida de suscripciones:", err);
  }

  return {
    checkedAt: now.toISOString(),
    trialsExpired,
    remindersSent,
    gracePeriodsExpired,
    expiredTokensPurged,
    anonymizedFileLogs,
  };
}
