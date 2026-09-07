import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth_token";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/books",
  "/users",
  "/roles",
  "/permissions",
  "/audit-logs",
  "/profile",
  "/sessions",
];

const PUBLIC_ONLY = ["/login", "/register"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function isPublicOnly(pathname: string): boolean {
  return PUBLIC_ONLY.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  return middleware(request);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;

  // Jika secret belum set, lewati (akan gagal di build tapi jangan crash middleware)
  const isAuthenticated =
    token && secret ? await verifyToken(token, secret) : false;

  // Protected route but not authenticated → redirect to /login
  if (isProtected(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user accessing login/register → redirect to /dashboard
  if (isPublicOnly(pathname) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/books/:path*",
    "/users/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/audit-logs/:path*",
    "/profile/:path*",
    "/sessions/:path*",
    "/login",
    "/register",
  ],
};
