import { type Request, type Response } from "express";
import type { UserDocument } from "../Models/user";
import { UserModel } from "../Models/user";
import jwt from "jsonwebtoken";

/**
 *  Générer un token JWT
 * @param user  UserDocument
 * @returns string
 */
const generateToken = (user: UserDocument) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

/**
 *  Enregistrer un nouvel utilisateur
 * @param req  Request
 * @param res  Response
 */
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "Tous les champs sont obligatoires" });
      return;
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "Cet utilisateur existe déjà" });
      return;
    }

    const user = new UserModel({ name, email, password });
    await user.save();

    res.status(201).json({
      _id: user._id,

      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 *  Connecter un utilisateur
 * @param req  Request
 * @param res  Response
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Email ou mot de passe invalide" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
