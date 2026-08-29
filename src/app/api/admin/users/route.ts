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

    if (!userId || !newStatus) {
      return NextResponse.json({ error: "Parámetros insuficientes" }, { status: 400 });
    }

    let updateData: any = { status: newStatus };

    if (addDays && newStatus === "TRIAL") {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(addDays));
      updateData.trialEndsAt = trialEndsAt;
    } else if (newStatus === "ACTIVE") {
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      updateData.currentPeriodEnd = currentPeriodEnd;
      updateData.gracePeriodEndsAt = null;
    }

    const updatedSub = await prisma.subscription.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
