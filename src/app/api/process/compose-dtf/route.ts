import { NextRequest, NextResponse } from "next/server";
import { composeDTFCanvas, DTFItem } from "@/lib/image-engine/dtf-compositor";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para armar y exportar pliegos DTF." },
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
    const rawFormat = formData.get("format") as string;
    const format: "58x100" | "58x200" = rawFormat === "58x200" ? "58x200" : "58x100";
    const layoutJson = formData.get("layout") as string;

    if (!layoutJson) {
      return NextResponse.json({ error: "Falta la información del layout" }, { status: 400 });
    }

    interface RawLayer {
      fileKey: string;
      xCm: number;
      yCm: number;
      widthCm: number;
      heightCm: number;
      rotation?: number;
    }

    let parsedLayers: RawLayer[] = [];
    try {
      parsedLayers = JSON.parse(layoutJson);
    } catch {
      return NextResponse.json({ error: "Formato de distribución JSON inválido" }, { status: 400 });
    }

    if (!Array.isArray(parsedLayers) || parsedLayers.length === 0) {
      return NextResponse.json({ error: "No hay elementos válidos en el lienzo" }, { status: 400 });
    }

    if (parsedLayers.length > 50) {
      return NextResponse.json(
        { error: "El lienzo admite un máximo de 50 elementos." },
        { status: 413 }
      );
    }

    // Validar tamaños de archivo ANTES de cargarlos en memoria para prevenir consumo excesivo de RAM
    for (const layer of parsedLayers) {
      const file = formData.get(layer.fileKey) as File | null;
      if (file) {
        const sizeError = fileTooLarge(file);
        if (sizeError) return sizeError;
      }
    }

    const dtfItems: DTFItem[] = [];

    for (const layer of parsedLayers) {
      const file = formData.get(layer.fileKey) as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        dtfItems.push({
          imageBuffer: Buffer.from(arrayBuffer),
          xCm: Number(layer.xCm) || 0,
          yCm: Number(layer.yCm) || 0,
          widthCm: Number(layer.widthCm) || 5,
          heightCm: Number(layer.heightCm) || 5,
          rotation: Number(layer.rotation) || 0,
        });
      }
    }

    if (dtfItems.length === 0) {
      return NextResponse.json({ error: "No se pudieron procesar las imágenes del pliego." }, { status: 400 });
    }

    const dtfCanvasBuffer = await composeDTFCanvas({
      format,
      items: dtfItems,
    });

    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "DTF_BUILDER",
          canvasSize: format === "58x100" ? "58x100cm" : "58x200cm",
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(dtfCanvasBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_dtf_${format}_300dpi_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al componer lienzo DTF:", error);
    return NextResponse.json(
      { error: "Error al exportar lienzo DTF: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
