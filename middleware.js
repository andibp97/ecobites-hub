// middleware.js
export function middleware(request) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Basic ${Buffer.from(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`).toString("base64")}`;

  if (authHeader !== expectedAuth) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }
}

export const config = { matcher: "/(.*)" };