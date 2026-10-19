import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { sendTransactionalEventEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso no autorizado: Se requiere rol de Administrador" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        failedAttempts: true,
        lockedUntil: true,
        createdAt: true,
        subscription: true,
        _count: {
          select: { toolUsages: true, payments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso no autorizado: Se requiere rol de Administrador" },
        { status: 403 }
      );
    }

    const {
      userId,
      newStatus,
      addDays,
      newPassword,
      toggleActive,
      unlockAccount,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Desbloqueo manual de cuenta bloqueada por intentos fallidos
    if (unlockAccount) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: adminUser.email,
          targetUserEmail: targetUser.email,
          action: "UNLOCK_ACCOUNT",
          details: `Cuenta desbloqueada manualmente por el administrador ${adminUser.email}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Cuenta de ${targetUser.email} desbloqueada exitosamente.`,
      });
    }

    // Activar o desactivar cuenta de usuario (baneo o suspensión total)
    if (typeof toggleActive === "boolean") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: toggleActive,
          tokenVersion: { increment: 1 }, // Revoca de inmediato todas las sesiones activas
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: adminUser.email,
          targetUserEmail: targetUser.email,
          action: toggleActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
          details: toggleActive
            ? `Cuenta activada por el administrador ${adminUser.email}`
            : `Cuenta desactivada y sesiones revocadas por el administrador ${adminUser.email}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Estado de la cuenta de ${targetUser.email} actualizado a ${
          toggleActive ? "Activo" : "Desactivado"
        }.`,
      });
    }

    // Restablecimiento de contraseña solicitado por el Administrador
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        );
      }
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          tokenVersion: { increment: 1 }, // Invalida sesiones previas tras cambio de contraseña
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      await prisma.auditLog.create({
        data: {
          adminEmail: adminUser.email,
          targetUserEmail: targetUser.email,
          action: "RESET_PASSWORD",
          details: `Contraseña restablecida exitosamente por el administrador para ${targetUser.email}`,
        },
      });

      if (!newStatus) {
        return NextResponse.json({
          success: true,
          message: `Contraseña de ${targetUser.email} actualizada con éxito y sesiones previas revocadas.`,
        });
      }
    }

    const VALID_STATUSES = [
      "TRIAL",
      "ACTIVE",
      "PAST_DUE",
      "GRACE_PERIOD",
      "SUSPENDED",
      "CANCELED",
    ];

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: "Parámetros insuficientes o estado no válido" },
        { status: 400 }
      );
    }

    const updateData: any = { status: newStatus };

    const parsedDays = parseInt(String(addDays), 10);
    if (!isNaN(parsedDays) && parsedDays > 0 && newStatus === "TRIAL") {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + Math.min(365, parsedDays));
      updateData.trialEndsAt = trialEndsAt;
      updateData.trialExpiredNoticeSent = false;
    } else if (newStatus === "ACTIVE") {
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      updateData.currentPeriodEnd = currentPeriodEnd;
      updateData.gracePeriodEndsAt = null;
      updateData.graceExpiredNoticeSent = false;
      updateData.cancelAtPeriodEnd = false;
    } else if (newStatus === "GRACE_PERIOD") {
      const graceEnds = new Date();
      graceEnds.setDate(graceEnds.getDate() + 3);
      updateData.gracePeriodEndsAt = graceEnds;
      updateData.graceExpiredNoticeSent = false;
    }

    const defaultTrial = new Date();
    defaultTrial.setDate(defaultTrial.getDate() + 5);

    const updatedSub = await prisma.subscription.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        status: newStatus,
        trialEndsAt: updateData.trialEndsAt || defaultTrial,
        currentPeriodEnd: updateData.currentPeriodEnd || null,
        gracePeriodEndsAt: updateData.gracePeriodEndsAt || null,
      },
    });

    // Registrar cambio en AuditLog
    await prisma.auditLog.create({
      data: {
        adminEmail: adminUser.email,
        targetUserEmail: targetUser.email,
        action: `CAMBIO_ESTADO_${newStatus}`,
        details: `Estado cambiado a ${newStatus}${
          addDays ? ` (+${addDays} días)` : ""
        }`,
      },
    });

    // Enviar notificación correspondiente si se suspendió o se activó periodo de gracia
    if (newStatus === "GRACE_PERIOD") {
      await sendTransactionalEventEmail({
        userId: targetUser.id,
        recipient: targetUser.email,
        userName: targetUser.name,
        eventType: "PAGO_FALLIDO_GRACIA",
        extraData: { gracePeriodEndsAt: updatedSub.gracePeriodEndsAt || undefined },
      }).catch(() => {});
    } else if (newStatus === "SUSPENDED") {
      await sendTransactionalEventEmail({
        userId: targetUser.id,
        recipient: targetUser.email,
        userName: targetUser.name,
        eventType: "FIN_PERIODO_GRACIA",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
