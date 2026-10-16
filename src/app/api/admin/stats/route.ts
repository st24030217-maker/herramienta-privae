import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformConfig } from "@/lib/settings";
import { runSubscriptionLifecycleChecks } from "@/lib/lifecycle";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 });
    }

    // Ejecutar revisión automática de ciclo de vida al cargar el panel
    await runSubscriptionLifecycleChecks().catch(() => {});

    const [
      totalUsers,
      activeSubscriptions,
      trialUsers,
      graceUsers,
      suspendedUsers,
      totalProcessings,
      errorProcessings,
      recentUsages,
      recentPayments,
      recentEmails,
      auditLogs,
      config,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "TRIAL" } }),
      prisma.subscription.count({ where: { status: "GRACE_PERIOD" } }),
      prisma.subscription.count({
        where: { status: { in: ["SUSPENDED", "CANCELED", "PAST_DUE"] } },
      }),
      prisma.toolUsage.count(),
      prisma.toolUsage.count({ where: { status: "ERROR" } }),
      prisma.toolUsage.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.payment.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.emailLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
      getPlatformConfig(),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        trialUsers,
        graceUsers,
        suspendedUsers,
        totalProcessings,
        errorProcessings,
      },
      recentUsages,
      recentPayments,
      recentEmails,
      auditLogs,
      config,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
