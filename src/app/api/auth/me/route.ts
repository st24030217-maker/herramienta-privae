import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
