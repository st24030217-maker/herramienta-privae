import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });
    const trialUsers = await prisma.subscription.count({
      where: { status: "TRIAL" },
    });
    const suspendedUsers = await prisma.subscription.count({
      where: { status: "SUSPENDED" },
    });
    const totalProcessings = await prisma.toolUsage.count();

    const recentUsages = await prisma.toolUsage.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        trialUsers,
        suspendedUsers,
        totalProcessings,
      },
      recentUsages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
