import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "0"); // Modern browsers use CSP instead
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP for the main app (not game iframes)
  if (!request.nextUrl.pathname.startsWith("/games/")) {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://lh3.googleusercontent.com https://www.gstatic.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://pagead2.googlesyndication.com",
        "frame-src 'self' https://aka-gaming.web.id",
        "media-src 'self' blob:",
      ].join("; ")
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
