import mongoose, { Document, Schema } from "mongoose";

interface IBook extends Document {
  title: string;
  author: string;
  note?: string;
  pdfUrl: string;
  lastModified: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    note: { type: String },
    pdfUrl: { type: String, required: true },
    lastModified: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Book = mongoose.model<IBook>("Book", bookSchema);
export default Book;
export type { IBook };
