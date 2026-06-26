import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactHistory from "@/models/ContactHistory";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const history = await ContactHistory.find({ contactId: params.id }).sort({ changedAt: -1 }).lean();
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
