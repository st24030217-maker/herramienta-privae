import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { action } = await req.json(); // "cancel" | "reactivate"

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!sub) {
      return NextResponse.json(
        { error: "No se encontró registro de suscripción" },
        { status: 404 }
      );
    }

    if (action === "cancel") {
      if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
        try {
          await stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        } catch (err) {
          console.warn("Aviso al cancelar en Stripe:", err);
        }
      }

      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: true },
      });

      return NextResponse.json({
        success: true,
        message: "Tu suscripción ha sido programada para cancelarse al finalizar el periodo actual.",
        subscription: updated,
      });
    }

    if (action === "reactivate") {
      if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
        try {
          await stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });
        } catch (err) {
          console.warn("Aviso al reactivar en Stripe:", err);
        }
      }

      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: false },
      });

      return NextResponse.json({
        success: true,
        message: "Tu suscripción ha sido reactivada para renovación mensual automática.",
        subscription: updated,
      });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al gestionar suscripción" },
      { status: 500 }
    );
  }
}
