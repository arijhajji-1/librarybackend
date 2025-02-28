import mongoose, { Schema } from "mongoose";
import type { Document, Model } from "mongoose";
import type { Book } from "../Types/book";

export interface BookDocument extends Book, Document {}

const bookSchema: Schema<BookDocument> = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  note: { type: String },
  pdfUrl: { type: String, required: true },
  modified: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

export const BookModel: Model<BookDocument> = mongoose.model<BookDocument>(
  "Book",
  bookSchema,
);
