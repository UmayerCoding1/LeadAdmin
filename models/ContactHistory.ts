import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactHistory extends Document {
  contactId: mongoose.Types.ObjectId;
  snapshot: any;
  changedAt: Date;
}

const ContactHistorySchema = new Schema({
  contactId: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
  snapshot: { type: Schema.Types.Mixed, required: true },
  changedAt: { type: Date, default: Date.now },
});

const ContactHistory: Model<IContactHistory> = mongoose.models.ContactHistory || mongoose.model<IContactHistory>("ContactHistory", ContactHistorySchema);

export default ContactHistory;
