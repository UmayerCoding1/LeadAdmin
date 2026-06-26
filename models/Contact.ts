import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  sheetUploadId?: mongoose.Types.ObjectId;
  keyword?: string;
  name?: string;
  fullAddress?: string;
  streetAddress?: string;
  city?: string;
  zip?: string;
  municipality?: string;
  country?: string;
  timezone?: string;
  phone1?: string;
  phoneStandardFormat?: string;
  phoneFromWebsite?: string;
  emailFromWebsite?: string;
  website?: string;
  domain?: string;
  firstCategory?: string;
  secondCategory?: string;
  claimedGoogleMyBusiness?: string;
  businessStatus?: string;
  hours?: string;
  imageUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  metaDescription?: string;
  extraFields?: Record<string, any>;
  responseStatus: "none" | "responded";
  emailSendCount: number;
  lastEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema(
  {
    sheetUploadId: { type: Schema.Types.ObjectId, ref: "SheetUpload" },
    keyword: String,
    name: String,
    fullAddress: String,
    streetAddress: String,
    city: String,
    zip: String,
    municipality: String,
    country: String,
    timezone: String,
    phone1: String,
    phoneStandardFormat: String,
    phoneFromWebsite: String,
    emailFromWebsite: String,
    website: String,
    domain: String,
    firstCategory: String,
    secondCategory: String,
    claimedGoogleMyBusiness: String,
    businessStatus: String,
    hours: String,
    imageUrl: String,
    facebookUrl: String,
    linkedinUrl: String,
    twitterUrl: String,
    instagramUrl: String,
    youtubeUrl: String,
    metaDescription: String,
    extraFields: { type: Schema.Types.Mixed, default: {} },
    responseStatus: { type: String, enum: ["none", "responded"], default: "none" },
    emailSendCount: { type: Number, default: 0 },
    lastEmailSentAt: Date,
  },
  { timestamps: true }
);

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
