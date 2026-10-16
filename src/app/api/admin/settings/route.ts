import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformConfig, updatePlatformSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    const config = await getPlatformConfig();
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const { planPriceUsd, stripePriceId, fileRetentionMinutes, storeReturnUrl } =
      await req.json();

    if (planPriceUsd !== undefined) {
      const price = parseFloat(String(planPriceUsd));
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: "El precio del plan debe ser mayor a 0" },
          { status: 400 }
        );
      }
      await updatePlatformSetting(
        "PLAN_PRICE_USD",
        price.toFixed(2),
        "Precio mensual del Plan Premium en USD"
      );
    }

    if (stripePriceId !== undefined) {
      await updatePlatformSetting(
        "STRIPE_PRICE_ID",
        String(stripePriceId).trim(),
        "ID de Precio de Stripe (opcional)"
      );
    }

    if (fileRetentionMinutes !== undefined) {
      const mins = Math.max(5, parseInt(String(fileRetentionMinutes), 10) || 60);
      await updatePlatformSetting(
        "FILE_RETENTION_MINUTES",
        String(mins),
        "Tiempo de retención temporal de archivos en minutos"
      );
    }

    if (storeReturnUrl !== undefined) {
      await updatePlatformSetting(
        "STORE_RETURN_URL",
        String(storeReturnUrl).trim() || "https://privaetextil.com",
        "URL oficial de regreso a la tienda Privae Textil"
      );
    }

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "CONFIGURACION_PLAN_PASARELA",
        details: `Precio=$${planPriceUsd} USD | StripePriceID=${
          stripePriceId || "Dinámico"
        } | Retención=${fileRetentionMinutes || 60}min`,
      },
    });

    const updatedConfig = await getPlatformConfig();
    return NextResponse.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
