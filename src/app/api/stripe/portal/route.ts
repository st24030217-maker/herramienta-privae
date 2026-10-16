import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para administrar tu suscripción." }, { status: 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!sub || !sub.stripeCustomerId) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa registrada en Stripe para administrar." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Error al crear sesión de portal de cliente Stripe:", error);
    return NextResponse.json(
      { error: "Error al abrir portal de facturación: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
