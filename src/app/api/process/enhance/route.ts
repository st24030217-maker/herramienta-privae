import { NextRequest, NextResponse } from "next/server";
import { enhanceImageResolution } from "@/lib/image-engine/enhance-resolution";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);

    if (user && !user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Activa tu suscripción para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawScale = parseInt(formData.get("scaleFactor") as string || "2", 10);
    const scaleFactor: 2 | 3 | 4 = rawScale === 4 ? 4 : rawScale === 3 ? 3 : 2;
    const rawSharpen = (formData.get("sharpenLevel") as string || "medium");
    const sharpenLevel: "none" | "light" | "medium" | "strong" = 
      rawSharpen === "none" || rawSharpen === "light" || rawSharpen === "strong" ? rawSharpen : "medium";
    const denoise = formData.get("denoise") === "true";

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const processedBuffer = await enhanceImageResolution(buffer, {
      scaleFactor,
      sharpenLevel,
      denoise,
    });

    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "ENHANCE",
          inputName: file.name,
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_ultra_${scaleFactor}x_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al mejorar resolución:", error);
    return NextResponse.json(
      { error: "Error al mejorar resolución: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
