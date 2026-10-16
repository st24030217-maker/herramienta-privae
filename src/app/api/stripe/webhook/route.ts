import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la cabecera stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no está configurado en las variables de entorno.");
    return NextResponse.json({ error: "Webhook no configurado en servidor" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Firma de Webhook de Stripe inválida: ${err.message}`);
    return NextResponse.json({ error: `Firma inválida: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = (typeof session.subscription === "string" ? session.subscription : session.subscription?.id) as string;

        if (userId) {
          let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          if (subscriptionId) {
            const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
            if (stripeSub?.current_period_end) {
              currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
            }
          }

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              status: "ACTIVE",
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              gracePeriodEndsAt: null,
            },
            create: {
              userId,
              status: "ACTIVE",
              trialEndsAt: new Date(),
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              planPrice: (session.amount_total || 1999) / 100,
            },
          });

          // Registrar pago en historial
          await prisma.payment.create({
            data: {
              userId,
              amount: (session.amount_total || 1999) / 100,
              currency: (session.currency || "usd").toUpperCase(),
              status: "PAID",
              gatewayReference: (session.payment_intent as string) || session.id,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const subscriptionId = (typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id) as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          if (subscriptionId) {
            const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
            if (stripeSub?.current_period_end) {
              currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
            }
          }

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "ACTIVE",
              currentPeriodEnd,
              gracePeriodEndsAt: null,
            },
          });

          await prisma.payment.create({
            data: {
              userId: sub.userId,
              amount: (invoice.amount_paid || 1999) / 100,
              currency: (invoice.currency || "usd").toUpperCase(),
              status: "PAID",
              gatewayReference: (invoice.payment_intent as string) || invoice.id,
              invoiceUrl: invoice.hosted_invoice_url || null,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          // Activar 3 días naturales de período de gracia con aviso en plataforma
          const graceEndsAt = new Date();
          graceEndsAt.setDate(graceEndsAt.getDate() + 3);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "GRACE_PERIOD",
              gracePeriodEndsAt: graceEndsAt,
            },
          });

          await prisma.payment.create({
            data: {
              userId: sub.userId,
              amount: (invoice.amount_due || 1999) / 100,
              currency: (invoice.currency || "usd").toUpperCase(),
              status: "FAILED",
              gatewayReference: invoice.id,
              invoiceUrl: invoice.hosted_invoice_url || null,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as any;
        const customerId = stripeSub.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "CANCELED",
              cancelAtPeriodEnd: false,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as any;
        const customerId = stripeSub.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          const currentPeriodEnd = stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
              currentPeriodEnd,
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error al procesar evento del webhook de Stripe:", error);
    return NextResponse.json({ error: "Fallo en procesamiento de evento" }, { status: 500 });
  }
}
