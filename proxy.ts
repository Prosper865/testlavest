import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE } from "@/lib/auth/session-token";

// Optimistic checks from the session cookie only (no database). Pages, server actions, and
// route handlers repeat the full check through the data access layer in lib/auth/dal.ts.

const platformRoutes = ["/dashboard", "/tesla", "/investments", "/plans", "/deposits", "/withdrawals", "/stocks", "/crypto", "/wallet", "/marketplace", "/verify"];
const authRoutes = ["/login", "/signup"];
const matches = (path: string, routes: string[]) => routes.some(route => path === route || path.startsWith(`${route}/`));

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (path === "/admin" || path.startsWith("/admin/")) {
    if (!session) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.nextUrl));
    if (session.role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  if (matches(path, platformRoutes) && !session) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.nextUrl));
  }

  if (matches(path, authRoutes) && session) {
    return NextResponse.redirect(new URL(session.role === "admin" ? "/admin" : "/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|logos|flags|videos).*)"],
};
