import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isValidAdminCredential,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const target = new URL("/admin/login", request.url);
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4096) return NextResponse.redirect(target, 303);

  const form = await request.formData();
  if (form.get("action") === "logout") {
    const response = NextResponse.redirect(target, 303);
    response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/admin", maxAge: 0 });
    return response;
  }

  const credential = form.get("credential");
  const session = createAdminSessionToken();
  if (typeof credential !== "string" || !session || !isValidAdminCredential(credential)) {
    target.searchParams.set("error", "invalid");
    return NextResponse.redirect(target, 303);
  }

  const response = NextResponse.redirect(new URL("/admin/deployments", request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
  return response;
}
