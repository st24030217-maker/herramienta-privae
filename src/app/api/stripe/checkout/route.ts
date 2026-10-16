import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para suscribirte." }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe no está configurado en las variables de entorno (falta STRIPE_SECRET_KEY)." },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Si existe STRIPE_PRICE_ID predefinido en env, se utiliza; si no, se define el producto dinámicamente
    const lineItem = process.env.STRIPE_PRICE_ID
      ? {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Membresía Taller Privae DTF - Acceso Ilimitado",
              description: "Preparación de archivos a 300 DPI, remoción de fondo, superresolución y armador de pliegos DTF.",
            },
            unit_amount: 1999, // $19.99 USD
            recurring: {
              interval: "month" as const,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [lineItem],
      success_url: `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account?payment=cancelled`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error al crear sesión de checkout de Stripe:", error);
    return NextResponse.json(
      { error: "Error al iniciar el pago con Stripe: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
