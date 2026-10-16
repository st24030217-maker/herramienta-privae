import { NextRequest, NextResponse } from "next/server";
import { runSubscriptionLifecycleChecks } from "@/lib/lifecycle";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const user = await getCurrentUser().catch(() => null);
      if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    const result = await runSubscriptionLifecycleChecks();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al ejecutar ciclo de vida" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
