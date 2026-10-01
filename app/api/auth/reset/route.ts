import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-token";

// Clears a session cookie that no longer maps to an active user (deleted or suspended),
// then sends the visitor to log in. Prevents a redirect loop between the proxy and pages.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.nextUrl));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
