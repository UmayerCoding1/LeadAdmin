import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const status = body.status === "responded" ? "responded" : "none";
    const updated = await Contact.findByIdAndUpdate(params.id, { responseStatus: status }, { new: true }).lean();
    
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
