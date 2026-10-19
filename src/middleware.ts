import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL_SECURITY_ERROR: La variable de entorno JWT_SECRET no está configurada en producción.");
    }
    return new TextEncoder().encode("dev_insecure_jwt_secret_only_for_local_development_300dpi");
  }
  return new TextEncoder().encode(secret);
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

      // Restricción estricta de rutas de Administrador: solo rol ADMIN
      if (isAdminRoute || isAdminApi) {
        if (verified.payload.role !== "ADMIN") {
          if (isAdminApi) {
            return NextResponse.json(
              { error: "Acceso denegado: Se requiere rol de Administrador" },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/", req.url));
        }
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
