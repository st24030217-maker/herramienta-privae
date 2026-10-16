import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET no está definido en variables de entorno para producción."
    );
  }
  return new TextEncoder().encode("privae_dev_insecure_secret_change_me");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("privae_auth_token")?.value;

  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAccountRoute || isAdminRoute || isAdminApi) {
    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const verified = await jwtVerify(token, getJwtSecret());
      if (!verified.payload.sub) {
        if (isAdminApi) {
          return NextResponse.json({ error: "Token de sesión no válido" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // Acceso garantizado para cualquier usuario autenticado en la plataforma
      if (isAdminRoute || isAdminApi) {
        // Permitido
      }
    } catch {
      // Token inválido o manipulado
      if (isAdminApi) {
        return NextResponse.json({ error: "Sesión expirada o inválida" }, { status: 401 });
      }
      const res = NextResponse.redirect(new URL("/auth/login", req.url));
      res.cookies.delete("privae_auth_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
};
