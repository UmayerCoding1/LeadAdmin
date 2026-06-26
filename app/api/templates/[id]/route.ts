import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const template = await EmailTemplate.findById(params.id);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const template = await EmailTemplate.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await EmailTemplate.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
