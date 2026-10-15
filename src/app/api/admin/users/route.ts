import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
      include: {
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
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
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
      return NextResponse.json({ error: "Parámetros insuficientes o estado no válido" }, { status: 400 });
    }

    let updateData: any = { status: newStatus };

    const parsedDays = parseInt(String(addDays), 10);
    if (!isNaN(parsedDays) && parsedDays > 0 && newStatus === "TRIAL") {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + Math.min(365, parsedDays));
      updateData.trialEndsAt = trialEndsAt;
    } else if (newStatus === "ACTIVE") {
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      updateData.currentPeriodEnd = currentPeriodEnd;
      updateData.gracePeriodEndsAt = null;
    }

    // Usar upsert para evitar error si el usuario no tenía registro previo de suscripción
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

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
