import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { keyword: { $regex: search, $options: "i" } },
        { emailFromWebsite: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ contacts, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
