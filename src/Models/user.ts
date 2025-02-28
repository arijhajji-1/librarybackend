import mongoose, { Schema } from "mongoose";
import type { Document, Model, Types } from "mongoose";
import type { User } from "../Types/user";

export interface UserDocument extends User, Document {
  _id: Types.ObjectId;
}

const userSchema: Schema<UserDocument> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Book", default: [] },
  ],
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return enteredPassword === this.password;
};

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema,
);
