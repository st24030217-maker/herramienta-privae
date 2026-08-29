import { NextRequest, NextResponse } from "next/server";
import { composeDTFCanvas, DTFItem } from "@/lib/image-engine/dtf-compositor";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user && !user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Suscríbete para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const format = (formData.get("format") as "58x100" | "58x200") || "58x100";
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

    const parsedLayers: RawLayer[] = JSON.parse(layoutJson);
    const dtfItems: DTFItem[] = [];

    for (const layer of parsedLayers) {
      const file = formData.get(layer.fileKey) as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        dtfItems.push({
          imageBuffer: Buffer.from(arrayBuffer),
          xCm: layer.xCm,
          yCm: layer.yCm,
          widthCm: layer.widthCm,
          heightCm: layer.heightCm,
          rotation: layer.rotation || 0,
        });
      }
    }

    if (dtfItems.length === 0) {
      return NextResponse.json({ error: "No hay elementos válidos en el lienzo" }, { status: 400 });
    }

    if (dtfItems.length > 50) {
      return NextResponse.json(
        { error: "El lienzo admite máximo 50 elementos." },
        { status: 413 }
      );
    }

    for (const layer of parsedLayers) {
      const file = formData.get(layer.fileKey) as File | null;
      if (file) {
        const sizeError = fileTooLarge(file);
        if (sizeError) return sizeError;
      }
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
