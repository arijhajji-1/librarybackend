import type { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  favorites: Types.ObjectId[]; // ✅ Liste des livres favoris
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}
