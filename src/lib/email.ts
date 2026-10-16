import { prisma } from "./prisma";

export type TransactionalEventType =
  | "ALTA_INICIO_PRUEBA"
  | "FIN_DE_PRUEBA"
  | "RECORDATORIO_3_DIAS"
  | "PAGO_APROBADO"
  | "PAGO_FALLIDO_GRACIA"
  | "FIN_PERIODO_GRACIA"
  | "RECUPERAR_CONTRASENA";

interface SendEventEmailParams {
  userId?: string;
  recipient: string;
  userName?: string | null;
  eventType: TransactionalEventType;
  extraData?: {
    trialEndsAt?: Date | string;
    currentPeriodEnd?: Date | string;
    gracePeriodEndsAt?: Date | string;
    amount?: number;
    currency?: string;
    resetUrl?: string;
  };
}

function buildEmailContent(params: SendEventEmailParams): {
  subject: string;
  html: string;
} {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://herramienta-privae.vercel.app";
  const greeting = params.userName ? `Hola ${params.userName},` : "Hola,";

  switch (params.eventType) {
    case "ALTA_INICIO_PRUEBA":
      return {
        subject: "Bienvenido a Privae Textil — Tu prueba gratuita de 5 días ha comenzado",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FFFFFF;margin-top:0;">PRIVAE TEXTIL · PLATAFORMA DTF</h2>
            <p>${greeting}</p>
            <p>Tu cuenta ha sido creada exitosamente y tu <strong>prueba gratuita de 5 días</strong> ya está activa.</p>
            <p>Durante estos 5 días tienes acceso completo a las <strong>5 herramientas de preparación DTF a 300 DPI</strong>: Remover Fondo, Mejorar Calidad, Eliminar un Color, Quitar Semitransparencias y Armador de Archivos DTF (58×100 cm y 58×200 cm).</p>
            <p><a href="${appUrl}" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Entrar a la Herramienta</a></p>
          </div>
        `,
      };

    case "FIN_DE_PRUEBA":
      return {
        subject: "Privae Textil — Tu prueba gratuita de 5 días ha finalizado",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FFFFFF;margin-top:0;">FIN DE PRUEBA GRATUITA (5 DÍAS)</h2>
            <p>${greeting}</p>
            <p>Tu periodo de prueba de 5 días ha concluido. Para continuar utilizando los 5 módulos de preparación y exportación DTF a 300 DPI, activa tu <strong>Suscripción Premium</strong> desde tu cuenta.</p>
            <p><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Activar Suscripción Premium</a></p>
          </div>
        `,
      };

    case "RECORDATORIO_3_DIAS":
      return {
        subject: "Privae Textil — Recordatorio: Tu suscripción se renovará en 3 días",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FFFFFF;margin-top:0;">RECORDATORIO DE PRÓXIMA RENOVACIÓN</h2>
            <p>${greeting}</p>
            <p>Te informamos que tu suscripción mensual a la plataforma <strong>Privae Textil DTF</strong> se renovará automáticamente en aproximadamente <strong>3 días</strong>.</p>
            <p>Puedes consultar tu fecha exacta de cobro o administrar tu método de pago en tu panel de usuario.</p>
            <p><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Revisar Mi Suscripción</a></p>
          </div>
        `,
      };

    case "PAGO_APROBADO":
      return {
        subject: "Privae Textil — Pago confirmado y acceso Premium renovado",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FFFFFF;margin-top:0;">PAGO APROBADO · ACCESO CONTINUO</h2>
            <p>${greeting}</p>
            <p>Hemos recibido correctamente tu pago${
              params.extraData?.amount
                ? ` por <strong>$${params.extraData.amount.toFixed(2)} ${
                    params.extraData.currency || "USD"
                  }</strong>`
                : ""
            }. Tu suscripción Premium permanece activa sin interrupciones.</p>
            <p><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Ver Recibo y Estado de Cuenta</a></p>
          </div>
        `,
      };

    case "PAGO_FALLIDO_GRACIA":
      return {
        subject: "Aviso Importante Privae Textil — Pago pendiente (3 días de gracia activos)",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FBBF24;margin-top:0;">PAGO FALLIDO · INICIO DE 3 DÍAS DE GRACIA</h2>
            <p>${greeting}</p>
            <p>No pudimos procesar el cobro de renovación de tu suscripción Premium. Te hemos otorgado <strong>3 días naturales de gracia</strong> para que no detengas tu producción mientras actualizas tu método de pago.</p>
            <p><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Actualizar Método de Pago Ahora</a></p>
          </div>
        `,
      };

    case "FIN_PERIODO_GRACIA":
      return {
        subject: "Privae Textil — Suscripción suspendida por falta de pago (Reactiva aquí)",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#F87171;margin-top:0;">FIN DEL PERIODO DE GRACIA · ACCESO SUSPENDIDO</h2>
            <p>${greeting}</p>
            <p>El plazo de 3 días naturales de gracia ha finalizado sin que se regularizara el pago, por lo que el acceso a las herramientas Premium ha quedado suspendido. Tu cuenta sigue conservada para que puedas reactivarla en cualquier momento.</p>
            <p><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Reactivar Mi Suscripción Premium</a></p>
          </div>
        `,
      };

    case "RECUPERAR_CONTRASENA":
      return {
        subject: "Privae Textil — Recuperación de contraseña",
        html: `
          <div style="font-family:sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;">
            <h2 style="color:#FFFFFF;margin-top:0;">RECUPERACIÓN DE CONTRASEÑA</h2>
            <p>${greeting}</p>
            <p>Solicitaste restablecer tu contraseña en la plataforma Privae Textil DTF. Haz clic en el siguiente botón para crear una nueva contraseña (válido por 1 hora):</p>
            <p><a href="${params.extraData?.resetUrl || `${appUrl}/auth/reset-password`}" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Restablecer Contraseña</a></p>
          </div>
        `,
      };
  }
}

export async function sendTransactionalEventEmail(params: SendEventEmailParams) {
  const { subject, html } = buildEmailContent(params);
  let deliveryStatus = "LOGGED";

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.EMAIL_FROM || "Privae Textil <notificaciones@privaetextil.com>";

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.recipient],
          subject,
          html,
        }),
      });
      deliveryStatus = res.ok ? "SENT" : "FALLBACK_LOGGED";
    } catch {
      deliveryStatus = "FALLBACK_LOGGED";
    }
  } else {
    deliveryStatus = "SENT";
  }

  try {
    await prisma.emailLog.create({
      data: {
        userId: params.userId || null,
        recipient: params.recipient,
        eventType: params.eventType,
        subject,
        status: deliveryStatus,
      },
    });
  } catch (err) {
    console.error("Error registrando EmailLog:", err);
  }

  return { subject, status: deliveryStatus };
}
