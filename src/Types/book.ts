import type { Types } from "mongoose";

export interface Book {

    title: string;
  author: string;
  note?: string;
  pdfUrl: string;
  modified: Date;
  user: Types.ObjectId;
}
export interface BookDocument extends Book, Document {}
