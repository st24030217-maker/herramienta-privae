import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendTransactionalEventEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
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
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const { userId, newStatus, addDays } = await req.json();

    const VALID_STATUSES = [
      "TRIAL",
      "ACTIVE",
      "PAST_DUE",
      "GRACE_PERIOD",
      "SUSPENDED",
      "CANCELED",
    ];

    if (!userId || !newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: "Parámetros insuficientes o estado no válido" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
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

    // Registrar cambio en AuditLog (Sección 09 del PDF: "con registro básico de cambios")
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
