import Stripe from "stripe";
import { prisma } from "./prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

/**
 * Obtiene o crea un cliente en Stripe para el usuario dado,
 * vinculándolo a su suscripción en la base de datos local.
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  // Si ya tiene stripeCustomerId registrado, retornarlo
  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  // Crear cliente en Stripe
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Guardar stripeCustomerId en la base de datos
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customer.id,
    },
    create: {
      userId,
      status: "TRIAL",
      trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      stripeCustomerId: customer.id,
      planPrice: 19.99,
    },
  });

  return customer.id;
}
