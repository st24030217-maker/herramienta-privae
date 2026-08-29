import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { action } = await req.json();

    let updateData: any = {};
    const now = new Date();

    if (action === "SUBSCRIBE_MONTHLY") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      updateData = {
        status: "ACTIVE",
        currentPeriodEnd: nextMonth,
        gracePeriodEndsAt: null,
      };

      // Registrar pago
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 19.99,
          currency: "USD",
          status: "PAID",
          gatewayReference: `SIM_PAY_${Date.now()}`,
        },
      });
    } else if (action === "TRIGGER_GRACE_PERIOD") {
      const graceEnd = new Date();
      graceEnd.setDate(graceEnd.getDate() + 3);
      updateData = {
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: graceEnd,
      };
    } else if (action === "CANCEL_SUBSCRIPTION") {
      updateData = {
        status: "CANCELED",
      };
    } else if (action === "RESET_TRIAL") {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 5);
      updateData = {
        status: "TRIAL",
        trialEndsAt: trialEnds,
        gracePeriodEndsAt: null,
      };
    }

    const updated = await prisma.subscription.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
