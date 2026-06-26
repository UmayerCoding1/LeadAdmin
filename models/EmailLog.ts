import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailLog extends Document {
  contactId: mongoose.Types.ObjectId;
  subject?: string;
  body?: string;
  sendType: "single" | "bulk";
  status: "sent" | "failed";
  errorMessage?: string;
  sentAt: Date;
}

const EmailLogSchema = new Schema({
  contactId: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
  subject: String,
  body: String,
  sendType: { type: String, enum: ["single", "bulk"], default: "single" },
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  errorMessage: String,
  sentAt: { type: Date, default: Date.now },
});

const EmailLog: Model<IEmailLog> = mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
