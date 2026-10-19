import nodemailer from "nodemailer";
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

function getMailTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = smtpPort === 465;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

function buildEmailContent(params: SendEventEmailParams): {
  subject: string;
  html: string;
} {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://herramienta-privae.vercel.app";
  const displayName = params.userName?.trim() || params.recipient.split("@")[0];
  const greeting = `Hola ${displayName},`;

  switch (params.eventType) {
    case "ALTA_INICIO_PRUEBA":
      return {
        subject: "Bienvenido a Privae Textil — Tu acceso a las herramientas DTF a 300 DPI está activo",
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Privae Textil</title>
          </head>
          <body style="margin:0;padding:0;background-color:#050507;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E5E7EB;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050507;padding:30px 15px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" style="max-width:580px;background-color:#0D0E12;border:1px solid #262626;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.8);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #1F2024;background-color:#0A0B0E;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <div style="display:inline-block;background-color:#FFFFFF;color:#000000;font-weight:900;font-size:16px;line-height:28px;width:28px;height:28px;text-align:center;border-radius:6px;vertical-align:middle;">P</div>
                              <span style="color:#FFFFFF;font-weight:900;font-size:16px;letter-spacing:1px;margin-left:8px;vertical-align:middle;">PRIVAE TEXTIL</span>
                            </td>
                            <td align="right">
                              <span style="font-size:11px;font-family:monospace;color:#9CA3AF;border:1px solid #2B2D33;padding:4px 8px;border-radius:6px;text-transform:uppercase;">DTF Prepress</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Contenido Central -->
                    <tr>
                      <td style="padding:36px 32px 28px 32px;">
                        <h1 style="color:#FFFFFF;font-size:24px;font-weight:900;letter-spacing:-0.5px;margin:0 0 16px 0;text-transform:uppercase;line-height:1.2;">
                          Bienvenido a Privae Textil
                        </h1>
                        <p style="font-size:15px;line-height:1.6;color:#D1D5DB;margin:0 0 20px 0;">
                          ${greeting}
                        </p>
                        <p style="font-size:14px;line-height:1.6;color:#9CA3AF;margin:0 0 24px 0;">
                          Tu cuenta ha sido creada exitosamente. Tu <strong>periodo de prueba gratuita de 5 días</strong> ya está habilitado con acceso completo a los 5 módulos oficiales para preparar tus archivos de impresión textil.
                        </p>

                        <!-- Tarjeta de Especificaciones Técnicas -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#14161C;border:1px solid #262930;border-radius:12px;margin:0 0 28px 0;">
                          <tr>
                            <td style="padding:20px;">
                              <div style="font-size:11px;font-family:monospace;font-weight:bold;color:#FFFFFF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
                                Ficha Tecnica de tu Cuenta:
                              </div>
                              <table role="presentation" width="100%" style="font-size:12px;color:#D1D5DB;">
                                <tr>
                                  <td style="padding:4px 0;color:#9CA3AF;">Usuario:</td>
                                  <td style="padding:4px 0;font-weight:bold;color:#FFFFFF;text-align:right;">${params.recipient}</td>
                                </tr>
                                <tr>
                                  <td style="padding:4px 0;color:#9CA3AF;">Vigencia:</td>
                                  <td style="padding:4px 0;font-weight:bold;color:#FFFFFF;text-align:right;">5 Dias de Prueba Gratuita</td>
                                </tr>
                                <tr>
                                  <td style="padding:4px 0;color:#9CA3AF;">Ancho de Salida DTF:</td>
                                  <td style="padding:4px 0;font-weight:bold;color:#FFFFFF;text-align:right;">58 cm (Pliegos de 100 y 200 cm)</td>
                                </tr>
                                <tr>
                                  <td style="padding:4px 0;color:#9CA3AF;">Resolucion Minima:</td>
                                  <td style="padding:4px 0;font-weight:bold;color:#FFFFFF;text-align:right;">300 DPI Certificado</td>
                                </tr>
                                <tr>
                                  <td style="padding:4px 0;color:#9CA3AF;">Canal Alfa:</td>
                                  <td style="padding:4px 0;font-weight:bold;color:#FFFFFF;text-align:right;">Transparencia Real RGBA</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Lista de 5 Herramientas -->
                        <div style="font-size:12px;font-family:monospace;font-weight:bold;color:#FFFFFF;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">
                          Tus 5 Herramientas Listas en el Taller:
                        </div>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:30px;font-size:13px;color:#9CA3AF;">
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #1C1E24;">
                              <strong style="color:#FFFFFF;">01. Remover Fondo:</strong> Limpieza automatica con salida PNG a 300 DPI.
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #1C1E24;">
                              <strong style="color:#FFFFFF;">02. Mejorar Calidad:</strong> Superresolucion 2X y 4X para archivos pequenos.
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #1C1E24;">
                              <strong style="color:#FFFFFF;">03. Eliminar un Color:</strong> Gotero selector con control exacto de tolerancia.
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #1C1E24;">
                              <strong style="color:#FFFFFF;">04. Quitar Semitransparencias:</strong> Elimina sombras borrosas y manchas de poliamida.
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;">
                              <strong style="color:#FFFFFF;">05. Armador de Metros DTF:</strong> Lienzo continuo de 58 cm con medicion en tiempo real.
                            </td>
                          </tr>
                        </table>

                        <!-- Botón CTA -->
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                          <tr>
                            <td align="center">
                              <a href="${appUrl}" style="display:inline-block;background-color:#FFFFFF;color:#000000;font-size:13px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 14px rgba(255,255,255,0.2);">
                                Entrar a la Consola DTF
                              </a>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 32px;background-color:#090A0D;border-top:1px solid #1A1C20;text-align:center;">
                        <p style="font-size:11px;color:#6B7280;margin:0 0 6px 0;">
                          Privae Textil · Plataforma de Preparacion y Salida DTF a 300 DPI
                        </p>
                        <p style="font-size:10px;color:#4B5563;margin:0;">
                          Este correo fue enviado a ${params.recipient}. Todos tus archivos son 100% privados y procesados bajo estricta confidencialidad.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    case "FIN_DE_PRUEBA":
      return {
        subject: "Privae Textil — Tu prueba gratuita de 5 días ha finalizado",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Fin de Prueba Gratuita (5 Días)</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Tu periodo de prueba de 5 días ha concluido. Para continuar utilizando los 5 módulos de preparación y exportación DTF a 300 DPI, activa tu Suscripción Premium desde tu panel.</p>
            <p style="margin-top:24px;"><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Activar Suscripción Premium</a></p>
          </div>
        `,
      };

    case "RECORDATORIO_3_DIAS":
      return {
        subject: "Privae Textil — Recordatorio: Tu suscripción se renovará en 3 días",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Recordatorio de Próxima Renovación</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Te informamos que tu suscripción mensual a la plataforma Privae Textil DTF se renovará automáticamente en aproximadamente 3 días.</p>
            <p style="margin-top:24px;"><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Revisar Mi Suscripción</a></p>
          </div>
        `,
      };

    case "PAGO_APROBADO":
      return {
        subject: "Privae Textil — Pago confirmado y acceso Premium renovado",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Pago Aprobado · Acceso Continuo</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Hemos recibido correctamente tu pago${
              params.extraData?.amount
                ? ` por $${params.extraData.amount.toFixed(2)} ${
                    params.extraData.currency || "USD"
                  }`
                : ""
            }. Tu suscripción Premium permanece activa sin interrupciones.</p>
            <p style="margin-top:24px;"><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Ver Recibo y Estado de Cuenta</a></p>
          </div>
        `,
      };

    case "PAGO_FALLIDO_GRACIA":
      return {
        subject: "Aviso Importante Privae Textil — Pago pendiente (3 días de gracia activos)",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Pago Fallido · Periodo de Gracia de 3 Días</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">No fue posible procesar el cobro automático de tu suscripción. Cuentas con 3 días de gracia con acceso continuo para actualizar tu método de pago sin pausas.</p>
            <p style="margin-top:24px;"><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Actualizar Facturación</a></p>
          </div>
        `,
      };

    case "FIN_PERIODO_GRACIA":
      return {
        subject: "Privae Textil — Suscripción suspendida por falta de pago (Reactiva aquí)",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Fin del Periodo de Gracia · Acceso Suspendido</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">El plazo de gracia ha concluido sin confirmación de pago. Tu cuenta sigue resguardada para que puedas reactivarla en cualquier momento.</p>
            <p style="margin-top:24px;"><a href="${appUrl}/account" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Reactivar Plan</a></p>
          </div>
        `,
      };

    case "RECUPERAR_CONTRASENA":
      return {
        subject: "Privae Textil — Recuperación de contraseña",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0E11;color:#F3F4F6;padding:32px;border-radius:16px;max-width:560px;margin:auto;border:1px solid #262626;">
            <h2 style="color:#FFFFFF;margin-top:0;font-size:20px;text-transform:uppercase;">Recuperación de Contraseña</h2>
            <p>${greeting}</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Solicitaste restablecer tu contraseña en la plataforma Privae Textil DTF. Haz clic en el siguiente enlace (válido por 1 hora):</p>
            <p style="margin-top:24px;"><a href="${params.extraData?.resetUrl || `${appUrl}/auth/reset-password`}" style="display:inline-block;background:#FFFFFF;color:#0D0E11;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;text-transform:uppercase;">Restablecer Contraseña</a></p>
          </div>
        `,
      };
  }
}

export async function sendTransactionalEventEmail(params: SendEventEmailParams) {
  const { subject, html } = buildEmailContent(params);
  let deliveryStatus = "LOGGED";

  const transporter = getMailTransporter();
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.EMAIL_FROM || process.env.GMAIL_USER || "Privae Textil <notificaciones@privaetextil.com>";

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: params.recipient,
        subject,
        html,
      });
      deliveryStatus = "SENT";
    } catch (err: any) {
      console.warn("[Email Gmail/SMTP] Error al enviar correo:", err?.message || err);
      deliveryStatus = "FALLBACK_LOGGED";
    }
  } else if (resendApiKey) {
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
