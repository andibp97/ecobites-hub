// middleware.js — protejează doar frontend-ul, lasă /api/* liber
export function middleware(request) {
  const authHeader = request.headers.get("authorization");

  // btoa() în loc de Buffer.from() — compatibil cu Edge Runtime (Vercel)
  const credentials = btoa(
    `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`
  );
  const expectedAuth = `Basic ${credentials}`;

  if (authHeader !== expectedAuth) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="EcoBites Hub"' },
    });
  }
}

// Aplică middleware DOAR pe frontend — exclude /api/* și fișiere statice
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};