import { Response } from "express";
import Book, { IBook } from "../Models/book";
import { AuthRequest } from "../middlewares/authMiddleware"; // ✅ Utilisation de AuthRequest pour req.user

// 📌 Récupérer tous les livres de l'utilisateur connecté
export const getBooks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const books: IBook[] = await Book.find({ user: req.user._id }); // ✅ Récupère uniquement les livres de l'utilisateur connecté
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Ajouter un livre pour l'utilisateur connecté
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

    const pdfUrl = req.file.path; // Multer saves file path
    const book = new Book({
      title,
      author,
      note,
      pdfUrl,
      user: req.user._id, // ✅ Ensure the book has a user
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error("❌ Error adding book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Supprimer un livre (seulement si l'utilisateur en est le propriétaire)
export const deleteBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // ✅ Vérification que l'utilisateur est bien le propriétaire du livre
    if (book.user.toString() !== req.user._id.toString()) {
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

// 📌 Mettre à jour un livre (seulement si l'utilisateur en est le propriétaire
export const updateBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, author, note } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // ✅ Vérification que l'utilisateur est bien le propriétaire du livre
    if (book.user.toString() !== req.user._id.toString()) {
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

// 📌 Récupérer un livre (seulement si l'utilisateur en est le propriétaire
export const getBook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // ✅ Vérification que l'utilisateur est bien le propriétaire du livre
    if (book.user.toString() !== req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to view this book" });
      return;
    }

    res.json(book);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
