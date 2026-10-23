import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const to = String((await req.formData().catch(() => null))?.get("to") ?? "/");
  const res = NextResponse.redirect(new URL(to === "/login" ? "/login" : "/", req.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
