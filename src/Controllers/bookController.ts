import { type Response, type Request, type NextFunction } from "express";
import type { Book } from "../Types/book";
import { BookModel } from "../Models/book";
import { UserModel } from "../Models/user";
import mongoose from "mongoose";
import { type AuthRequest } from "../middlewares/authMiddleware"; // ✅ Utilisation de AuthRequest pour req.user

/**
 * Récupérer les livres favoris de l'utilisateur
 * @param req AuthRequest
 * @param res Response
 */
export const getFavoriteBooks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }
    const user = await UserModel.findById(req.user._id).populate("favorites");
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    res.json(user.favorites);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Récupérer tous les livres
 * @param req Request
 * @param res Response
 */
export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const books: Book[] = await BookModel.find(); // Récupère tous les livres
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Récupérer tous les livres de l'utilisateur
 * @param req AuthRequest
 * @param res Response
 */
export const getBooks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const books: Book[] = await BookModel.find({ user: req.user._id }); // ✅ Récupère uniquement les livres de l'utilisateur connecté
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Ajouter un livre
 * @param req AuthRequest
 * @param res Response
 */
export const addBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, author, note } = req.body;
    console.log("🔍 Request body:", req.body);
    console.log("📂 Uploaded file:", req.file);

    if (!title || !author || !req.file?.path) {
      res.status(400).json({ message: "Title, author, and PDF are required" });
      return;
    }

    const pdfUrl = req.file.path;
    const book = new BookModel({
      title,
      author,
      note,
      pdfUrl,
      user: req.user ? req.user._id : undefined,
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error("❌ Error adding book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 *  Supprimer un livre
 * @param req  AuthRequest
 * @param res  Response
 */
export const deleteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // ✅ Vérification que l'utilisateur est bien le propriétaire du livre
    if (!req.user || book.user.toString() !== req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to delete this book" });
      return;
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 *  Mettre à jour un livre
 * @param req  AuthRequest
 * @param res  Response
 */
export const updateBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, author, note } = req.body;
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // ✅ Vérification que l'utilisateur est bien le propriétaire du livre
    if (!req.user || book.user.toString() !== req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to update this book" });
      return;
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.note = note || book.note;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error("❌ Error updating book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Récupérer un livre
 * @param req Request
 * @param res Response
 */
export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.json(book);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Ajouter un livre aux favoris de l'utilisateur
 * @param req AuthRequest
 * @param res Response
 */
export const addFavoriteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }
    const { bookId } = req.params; // On récupère l'ID depuis l'URL
    const book = await BookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ message: "Livre non trouvé" });
      return;
    }
    // Récupérer l'utilisateur depuis le modèle User
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    // Si le livre n'est pas déjà dans les favoris, on l'ajoute
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    if (!user.favorites.includes(bookObjectId)) {
      user.favorites.push(bookObjectId);
      await user.save();
    }
    res.json({
      message: "Livre ajouté aux favoris",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout aux favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
/**
 * Supprimer un livre des favoris de l'utilisateur
 * @param req AuthRequest
 * @param res Response
 */
export const removeFavoriteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }
    const { bookId } = req.params;
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    if (user.favorites.includes(bookObjectId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
      await user.save();
    }
    res.json({
      message: "Livre retiré des favoris",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des favoris:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
