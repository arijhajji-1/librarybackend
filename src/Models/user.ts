import mongoose, { Schema } from "mongoose";
import type { Document, Model, Types } from "mongoose";
import type { User } from "../Types/user";

// Extend the IUser interface to include Mongoose document properties.
export interface UserDocument extends User, Document {
  _id: Types.ObjectId;
}

// Define the user schema using the fields from IUser.
const userSchema: Schema<UserDocument> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

// Optionally, add instance methods such as matchPassword.
// Adjust the implementation as needed (for example, using bcrypt for hashing).
userSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  // Dummy implementation—replace with actual password comparison logic.
  return enteredPassword === this.password;
};

// Create and export the User model.
export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema,
);
