import { NextRequest, NextResponse } from "next/server";
import { cleanAlphaChannel } from "@/lib/image-engine/clean-alpha";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para utilizar las herramientas de preparación DTF." },
        { status: 401 }
      );
    }
    if (!user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Activa tu suscripción para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawThreshold = parseInt(formData.get("threshold") as string || "40");
    const threshold = Math.min(254, Math.max(1, isNaN(rawThreshold) ? 40 : rawThreshold));
    const boostSolid = formData.get("boostSolid") === "true";
    const smoothEdges = formData.get("smoothEdges") === "true";

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const processedBuffer = await cleanAlphaChannel(buffer, {
      threshold,
      boostSolid,
      smoothEdges,
    });

    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "CLEAN_ALPHA",
          inputName: file.name,
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_dtf_limpio_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al limpiar semitransparencias:", error);
    return NextResponse.json(
      { error: "Error al procesar semitransparencias: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
