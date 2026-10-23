import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { encode, SESSION_COOKIE, type Role } from "@/lib/session";
import { passcodeOk } from "@/lib/passcode";
import { checkRate } from "@/lib/ratelimit";

const NAMES: Record<Role, string> = { citizen: "Demo Citizen", reviewer: "Demo Reviewer" };
const back = (req: Request, error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, req.url), 303);

export async function POST(req: Request) {
  const form = await req.formData();
  const role = form.get("role");
  if (role !== "citizen" && role !== "reviewer") return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  if ((await checkRate(req, "login", 30, 600)).ok === false) return back(req, "rate");
  if (role === "reviewer") {
    // Reviewer access needs the demo passcode. Without REVIEWER_PASSCODE it is switched off in production.
    const expected = process.env.REVIEWER_PASSCODE;
    if (!expected && process.env.NODE_ENV === "production") return back(req, "reviewer-off");
    if (expected) {
      if ((await checkRate(req, "login-reviewer", 5, 600)).ok === false) return back(req, "rate");
      if (!passcodeOk(String(form.get("passcode") ?? ""), expected)) return back(req, "passcode");
    }
  }

  const res = NextResponse.redirect(new URL(role === "reviewer" ? "/review" : "/dashboard", req.url), 303);
  res.cookies.set(SESSION_COOKIE, encode({ role, name: NAMES[role], sid: randomBytes(16).toString("hex") }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}
