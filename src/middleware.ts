import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  return new TextEncoder().encode("privae_dev_insecure_secret_change_me");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("privae_auth_token")?.value;

  // Rutas que requieren autenticación
  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAccountRoute || isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const verified = await jwtVerify(token, getJwtSecret());
      if (!verified.payload.sub) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    } catch {
      // Token inválido o expirado
      const res = NextResponse.redirect(new URL("/auth/login", req.url));
      res.cookies.delete("privae_auth_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
