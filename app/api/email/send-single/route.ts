import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import EmailLog from "@/models/EmailLog";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { contactId, subject, body } = await request.json();

    const contact = await Contact.findById(contactId);
    if (!contact || !contact.emailFromWebsite) {
      return NextResponse.json({ error: "Contact missing or lacks email" }, { status: 400 });
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
        sendType: "single",
        status: "sent"
      });

      contact.emailSendCount += 1;
      contact.lastEmailSentAt = new Date();
      await contact.save();

      return NextResponse.json({ success: true });
    } catch (sendError: any) {
      // Log failure
      await EmailLog.create({
        contactId: contact._id,
        subject,
        body,
        sendType: "single",
        status: "failed",
        errorMessage: sendError.message || "Unknown error"
      });
      return NextResponse.json({ error: "SMTP Error: " + sendError.message }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
