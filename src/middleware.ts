import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Generate nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Content Security Policy - Report-only mode for initial testing
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' https://images.ctfassets.net data: blob:;
    connect-src 'self' https://cdn.contentful.com https://api.contentful.com https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Security headers
  const headers = {
    // Start with report-only mode to test CSP without breaking functionality
    "Content-Security-Policy-Report-Only": cspHeader,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-DNS-Prefetch-Control": "on",
    // Only add HSTS in production
    ...(process.env.NODE_ENV === "production" && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    }),
  };

  // Apply headers to response
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // Add nonce to response headers for use in app
  response.headers.set("x-nonce", nonce);

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
