import { NextRequest, NextResponse } from "next/server";
import { removeColorFromImage } from "@/lib/image-engine/remove-color";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge, validateImageBuffer } from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para remover colores de tus imágenes." },
        { status: 401 }
      );
    }

    if (!user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Activa tu suscripción para continuar." },
        { status: 403 }
      );
    }

    const { allowed, retryAfterSec } = rateLimit(`process:${user.id}`, 30, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Has superado el límite de operaciones por minuto. Espera ${retryAfterSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const r = Math.min(255, Math.max(0, parseInt(formData.get("r") as string || "255", 10) || 0));
    const g = Math.min(255, Math.max(0, parseInt(formData.get("g") as string || "255", 10) || 0));
    const b = Math.min(255, Math.max(0, parseInt(formData.get("b") as string || "255", 10) || 0));
    const tolerance = Math.min(100, Math.max(1, parseInt(formData.get("tolerance") as string || "30", 10) || 30));
    const smoothness = Math.min(50, Math.max(0, parseInt(formData.get("smoothness") as string || "10", 10) || 10));
    const defringe = formData.get("defringe") !== "false";
    const mode = (formData.get("mode") as string) === "contiguous" ? "contiguous" : "global";

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const magicError = validateImageBuffer(buffer);
    if (magicError) return magicError;

    const processedBuffer = await removeColorFromImage(
      buffer,
      { r, g, b },
      {
        tolerance,
        smoothness,
        defringe,
        mode,
      }
    );

    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "REMOVE_COLOR",
          inputName: file.name,
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_sin_color_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al procesar eliminación de color:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
