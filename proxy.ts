// proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { safeVerifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/cookies";
import { logger } from "@/lib/logger";
import { getPrisma } from "./lib/prisma";

const CUSTOMER_PREFIX = "/customer";
const PROVIDER_PREFIX = "/provider";
const API_CUSTOMER_PREFIX = "/api/customer";
const API_PROVIDER_PREFIX = "/api/provider";
const API_PREFIX = "/api";
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/categories",
  "/api/auth/2fa/verify-login",
];

const AUTH_PAGES = ["/auth/login", "/auth/register"];

export async function proxy(req: NextRequest) {
  logger.info({
    method: req.method,
    path: req.nextUrl.pathname,
  });

  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE)?.value;

  const payload = token ? await safeVerifyToken(token) : null;

  let isAuthenticated = false;
  try {
    if (payload) {
      const user = await getPrisma().user.findUnique({
        where: { id: payload.userId },
        select: {
          passwordVersion: true,
        },
      });

      isAuthenticated =
        !!user && user.passwordVersion === payload.passwordVersion;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

  const isCustomerRoute = pathname.startsWith(CUSTOMER_PREFIX);

  const isProviderRoute = pathname.startsWith(PROVIDER_PREFIX);

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isApiRoute = pathname.startsWith(API_PREFIX);

  const isPublicApi = PUBLIC_API_ROUTES.some((p) => pathname.startsWith(p));

  if (isApiRoute && isPublicApi) {
    return NextResponse.next();
  }

  const isCustomerApi = pathname.startsWith(API_CUSTOMER_PREFIX);

  const isProviderApi = pathname.startsWith(API_PROVIDER_PREFIX);

  // Unauthenticated user
  if ((isCustomerRoute || isProviderRoute) && !isAuthenticated) {
    const url = new URL("/auth/login", req.url);

    url.searchParams.set("from", pathname);

    return NextResponse.redirect(url);
  }

  // Logged-in users shouldn't visit login/register
  if (isAuthPage && isAuthenticated) {
    const dest =
      payload?.role === "PROVIDER"
        ? "/provider/dashboard"
        : "/customer/dashboard";

    return NextResponse.redirect(new URL(dest, req.url));
  }
  // Protect all API routes
  if (isApiRoute) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isCustomerApi && payload?.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isProviderApi && payload?.role !== "PROVIDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // Customer trying to access provider pages
  if (isProviderRoute && payload?.role !== "PROVIDER") {
    return NextResponse.redirect(new URL("/customer/dashboard", req.url));
  }

  // Provider trying to access customer pages
  if (isCustomerRoute && payload?.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/provider/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/provider/:path*",
    "/auth/login",
    "/auth/register",
    "/api/:path*",
  ],
};
