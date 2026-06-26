import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import EmailLog from "@/models/EmailLog";

export async function GET() {
  try {
    await dbConnect();
    const totalContacts = await Contact.countDocuments();
    const totalResponded = await Contact.countDocuments({ responseStatus: "responded" });
    const totalEmailsSent = await EmailLog.countDocuments({ status: "sent" });
    
    // Aggregate past 7 days emails
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const emailStats = await EmailLog.aggregate([
      { $match: { sentAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      totalContacts,
      totalResponded,
      totalEmailsSent,
      emailStats
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
