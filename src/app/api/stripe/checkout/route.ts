import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { getPlatformConfig } from "@/lib/settings";

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

    const config = await getPlatformConfig();
    const customerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const unitAmountCents = Math.max(100, Math.round(config.planPriceUsd * 100));

    // Si existe STRIPE_PRICE_ID configurado en Admin o env, se utiliza; si no, usa el precio dinámico configurable por Admin
    const lineItem = config.stripePriceId
      ? {
          price: config.stripePriceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: (process.env.STRIPE_CURRENCY || "mxn").toLowerCase(),
            product_data: {
              name: "Suscripción Premium Privae Textil DTF - Acceso Ilimitado",
              description: "Acceso completo a los 5 módulos de preparación de imágenes y archivos DTF a 300 DPI.",
            },
            unit_amount: unitAmountCents,
            recurring: {
              interval: "month" as const,
            },
          },
          quantity: 1,
        };

    const isEmbedded = req.nextUrl.searchParams.get("embedded") === "true";

    const sessionParams: any = {
      customer: customerId,
      mode: "subscription",
      line_items: [lineItem],
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
    };

    if (isEmbedded) {
      sessionParams.ui_mode = "embedded";
      sessionParams.return_url = `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionParams.success_url = `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      sessionParams.cancel_url = `${origin}/account?payment=cancelled`;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      clientSecret: session.client_secret,
    });
  } catch (error: any) {
    console.error("Error al crear sesión de checkout de Stripe:", error);
    return NextResponse.json(
      { error: "Error al iniciar el pago con Stripe: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
