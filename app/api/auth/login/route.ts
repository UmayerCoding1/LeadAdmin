import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = password === adminPasswordHash;

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ role: "admin", email });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
