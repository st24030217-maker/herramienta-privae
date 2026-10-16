import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEventEmail } from "@/lib/email";
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
        const subscriptionId = (typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id) as string;

        if (userId) {
          let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          let paymentMethodBrand: string | null = null;
          let paymentMethodLast4: string | null = null;

          if (subscriptionId) {
            const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ["default_payment_method"],
            })) as any;
            if (stripeSub?.current_period_end) {
              currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
            }
            if (stripeSub?.default_payment_method?.card) {
              paymentMethodBrand = stripeSub.default_payment_method.card.brand || "Tarjeta";
              paymentMethodLast4 = stripeSub.default_payment_method.card.last4 || null;
            }
          }

          const amountPaid = (session.amount_total || 1999) / 100;

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              status: "ACTIVE",
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              gracePeriodEndsAt: null,
              cancelAtPeriodEnd: false,
              paymentMethodBrand,
              paymentMethodLast4,
              planPrice: amountPaid,
            },
            create: {
              userId,
              status: "ACTIVE",
              trialEndsAt: new Date(),
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              paymentMethodBrand,
              paymentMethodLast4,
              planPrice: amountPaid,
            },
          });

          await prisma.payment.create({
            data: {
              userId,
              amount: amountPaid,
              currency: (session.currency || "usd").toUpperCase(),
              status: "PAID",
              gatewayReference: (session.payment_intent as string) || session.id,
            },
          });

          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user?.email) {
            await sendTransactionalEventEmail({
              userId: user.id,
              recipient: user.email,
              userName: user.name,
              eventType: "PAGO_APROBADO",
              extraData: {
                amount: amountPaid,
                currency: (session.currency || "usd").toUpperCase(),
                currentPeriodEnd,
              },
            }).catch(() => {});
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const subscriptionId = (typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id) as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true },
        });

        if (sub) {
          let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          if (subscriptionId) {
            const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
            if (stripeSub?.current_period_end) {
              currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
            }
          }

          const amountPaid = (invoice.amount_paid || 1999) / 100;

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "ACTIVE",
              currentPeriodEnd,
              gracePeriodEndsAt: null,
              graceExpiredNoticeSent: false,
            },
          });

          await prisma.payment.create({
            data: {
              userId: sub.userId,
              amount: amountPaid,
              currency: (invoice.currency || "usd").toUpperCase(),
              status: "PAID",
              gatewayReference: (invoice.payment_intent as string) || invoice.id,
              invoiceUrl: invoice.hosted_invoice_url || null,
            },
          });

          if (sub.user?.email) {
            await sendTransactionalEventEmail({
              userId: sub.userId,
              recipient: sub.user.email,
              userName: sub.user.name,
              eventType: "PAGO_APROBADO",
              extraData: {
                amount: amountPaid,
                currency: (invoice.currency || "usd").toUpperCase(),
                currentPeriodEnd,
              },
            }).catch(() => {});
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true },
        });

        if (sub) {
          // Otorgar 3 días naturales de gracia (Sección 02 y 08 del PDF)
          const graceEndsAt = new Date();
          graceEndsAt.setDate(graceEndsAt.getDate() + 3);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "GRACE_PERIOD",
              gracePeriodEndsAt: graceEndsAt,
              graceExpiredNoticeSent: false,
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
              failureReason:
                invoice.last_finalization_error?.message ||
                "Fallo en el cobro de renovación reportado por Stripe",
            },
          });

          if (sub.user?.email) {
            await sendTransactionalEventEmail({
              userId: sub.userId,
              recipient: sub.user.email,
              userName: sub.user.name,
              eventType: "PAGO_FALLIDO_GRACIA",
              extraData: { gracePeriodEndsAt: graceEndsAt },
            }).catch(() => {});
          }
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
