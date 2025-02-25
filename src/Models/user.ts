import mongoose, { Schema, Model, Document,Types } from "mongoose";
import bcrypt from "bcryptjs";

// Définition de l'interface User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  favorites: Types.ObjectId[]; // ✅ Liste des livres favoris
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

// Schéma Mongoose
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Book" }], // ✅ Référence aux livres favoris

  },
  { timestamps: true }
);

// Hashage du mot de passe avant sauvegarde
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Vérification du mot de passe
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Création du modèle
export const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;