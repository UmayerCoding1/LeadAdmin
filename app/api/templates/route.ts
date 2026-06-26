import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

export async function GET() {
  try {
    await dbConnect();
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const template = await EmailTemplate.create(body);
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
