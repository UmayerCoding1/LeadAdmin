import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import EmailLog from "@/models/EmailLog";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { contactIds, subject, body } = await request.json();

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "No contacts selected" }, { status: 400 });
    }

    // Filter out users who have responded
    const contacts = await Contact.find({ 
      _id: { $in: contactIds },
      responseStatus: { $ne: "responded" } 
    });

    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      if (!contact.emailFromWebsite) {
        failed++;
        continue;
      }

      try {
        await sendMail({
          to: contact.emailFromWebsite,
          subject,
          html: body.replace(/\n/g, "<br>"),
        });

        await EmailLog.create({
          contactId: contact._id,
          subject,
          body,
          sendType: "bulk",
          status: "sent"
        });

        contact.emailSendCount += 1;
        contact.lastEmailSentAt = new Date();
        await contact.save();
        sent++;
      } catch (err: any) {
        failed++;
        await EmailLog.create({
          contactId: contact._id,
          subject,
          body,
          sendType: "bulk",
          status: "failed",
          errorMessage: err.message
        });
      }
      
      // Artificial delay to respect poor SMTPs rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
