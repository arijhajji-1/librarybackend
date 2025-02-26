import { type Request, type Response } from "express";
import type { UserDocument } from "../Models/user";
import { UserModel } from "../Models/user";
import mongoose from "mongoose";
import { type AuthRequest } from "../middlewares/authMiddleware";
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

/**
 *  Récupérer les informations de l'utilisateur
 * @param req  AuthRequest
 * @param res  Response
 */
export const addFavoriteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ message: "ID du livre invalide" });
      return;
    }

    const user = await UserModel.findById(req.user?._id);
    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé" });
      return;
    }

    if (user.favorites.includes(bookId)) {
      res.status(400).json({ message: "Livre déjà ajouté aux favoris" });
      return;
    }

    user.favorites.push(bookId);
    await user.save();

    res.json({
      message: "Livre ajouté aux favoris",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("❌ Erreur ajout favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 *  Supprimer un livre des favoris
 * @param req  AuthRequest
 * @param res  Response
 */
export const removeFavoriteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.body;

    const user = await UserModel.findById(req.user?._id);
    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé" });
      return;
    }

    if (!user.favorites.includes(bookId)) {
      res.status(400).json({ message: "Livre non trouvé dans les favoris" });
      return;
    }

    user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
    await user.save();

    res.json({
      message: "Livre supprimé des favoris",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("❌ Erreur suppression favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 *  Récupérer les livres favoris de l'utilisateur
 * @param req  AuthRequest
 * @param res  Response
 */
export const getFavoriteBooks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user?._id).populate("favorites");
    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.json(user.favorites);
  } catch (error) {
    console.error("❌ Erreur récupération favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
