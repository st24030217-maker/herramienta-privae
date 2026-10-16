import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para procesar tus archivos." },
        { status: 401 }
      );
    }

    if (!user.subscription.isAccessGranted) {
      return NextResponse.json(
        {
          error:
            "Tu periodo de prueba de 5 días o tu suscripción ha vencido. Activa tu plan Premium para continuar.",
        },
        { status: 403 }
      );
    }

    const { toolName, inputName, canvasSize, status, errorMessage } =
      await req.json();

    await prisma.toolUsage.create({
      data: {
        userId: user.id,
        toolName: toolName || "CLEAN_ALPHA",
        inputName: inputName || "archivo.png",
        outputDpi: 300,
        canvasSize: canvasSize || null,
        status: status || "SUCCESS",
        errorMessage: errorMessage || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al registrar operación" },
      { status: 500 }
    );
  }
}
