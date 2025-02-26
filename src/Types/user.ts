import type { Types } from "mongoose";

export interface User {

  
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  favorites: Types.ObjectId[]; // ✅ Liste des livres favoris
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}
export interface IUserDocument extends User, Document {
  _id: Types.ObjectId;
}
