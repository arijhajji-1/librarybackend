import mongoose, { Document, Schema, Types } from "mongoose";

// Interface TypeScript pour Book
interface IBook extends Document {
  title: string;
  author: string;
  note?: string;
  pdfUrl: string;
  lastModified: Date;
  user: Types.ObjectId; // ✅ Toujours stocké en `ObjectId`
}

// Définition du schéma Mongoose
const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    note: { type: String },
    pdfUrl: { type: String, required: true },
    lastModified: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Référence User
  },
  { timestamps: true }
);

// ✅ Correction : Convertir `user` en string lors de la conversion JSON
bookSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.user = ret.user.toString(); // ✅ Convertir `ObjectId` en `string`
    return ret;
  },
});

// Création du modèle
const Book = mongoose.model<IBook>("Book", bookSchema);
export default Book;
export type { IBook };
