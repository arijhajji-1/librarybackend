import type { Types } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  note?: string;
  pdfUrl: string;
  lastModified: Date;
  user: Types.ObjectId;
}
