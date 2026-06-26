import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import ContactHistory from "@/models/ContactHistory";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const contact = await Contact.findById(params.id).lean();
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();

    const currentContact = await Contact.findById(params.id).lean();
    if (!currentContact) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Snapshot backup
    await ContactHistory.create({
      contactId: currentContact._id,
      snapshot: currentContact,
    });

    const updated = await Contact.findByIdAndUpdate(params.id, { $set: body }, { new: true }).lean();
    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
