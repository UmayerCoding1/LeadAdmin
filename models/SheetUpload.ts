import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISheetUpload extends Document {
  originalFileName?: string;
  storedFilePath?: string;
  rowCount?: number;
  columns?: string[];
  uploadedAt: Date;
}

const SheetUploadSchema = new Schema({
  originalFileName: String,
  storedFilePath: String,
  rowCount: Number,
  columns: [String],
  uploadedAt: { type: Date, default: Date.now },
});

const SheetUpload: Model<ISheetUpload> = mongoose.models.SheetUpload || mongoose.model<ISheetUpload>("SheetUpload", SheetUploadSchema);

export default SheetUpload;
