import { Request, Response } from "express";
import Book, { IBook } from "../Models/book";

export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books: IBook[] = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, note } = req.body;
    console.log("🔍 Request body:", req.body);
    console.log("📂 Uploaded file:", req.file);

    if (!title || !author || !req.file?.path) {
      res.status(400).json({ message: "Title, author, and PDF are required" });
      return;
    }

    const pdfUrl = req.file.path; // Multer saves file path
    const book = new Book({ title, author, note, pdfUrl });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error("❌ Error adding book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
