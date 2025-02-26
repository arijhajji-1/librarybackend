import { type Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import type { Book } from "../Types/book";
import mongoose from "mongoose";
import { BookModel } from "../Models/book";
import type { UserDocument } from "../Models/user";
import {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
  getBook,
} from "../Controllers/bookController";

// Mock dependencies
jest.mock("../Models/book");

const createResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Book Controllers", () => {
  describe("getBooks", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      
      req = {
        user: { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011") } as unknown as UserDocument
      };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return the list of books for the user", async () => {
      const books: Book[] = [
        {  title: "Book 1", author: "Author 1", pdfUrl: "path/to/pdf",modified: new Date(),user: "userId" },
        {  title: "Book 2", author: "Author 2", pdfUrl: "path/to/pdf" ,modified: new Date(),user: "userId"},
      ];
      (BookModel.find as jest.Mock).mockResolvedValueOnce(books);

      await getBooks(req as AuthRequest, res);
      expect(res.json).toHaveBeenCalledWith(books);
    });
  });

  describe("addBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = { body: {}, file: {}, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

   

    it("should add a book successfully", async () => {
      req.body = { title: "Book Title", author: "Author", note: "A note", pdfUrl: "path/to/pdf" };

      // Create a fake book instance with a save method
      const mockBook = {
        _id: "bookId",
        title: "Book Title",
        author: "Author",
        note: "A note",
        pdfUrl: "path/to/pdf",
        user: "userId",
        save: jest.fn().mockResolvedValueOnce(true),
      };

      // When a new BookModel is instantiated, return our mockBook
      (BookModel as unknown as jest.Mock).mockImplementation(() => mockBook);

      await addBook(req as AuthRequest, res);
      expect(mockBook.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBook);
    });
  });

  describe("deleteBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = { params: { id: "bookId" }, user: { _id : "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 404 if the book is not found", async () => {
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await deleteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await deleteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not authorized to delete this book",
      });
    });

    it("should delete the book successfully", async () => {
      const book = {
        user: "userId",
        deleteOne: jest.fn().mockResolvedValueOnce(true),
      };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await deleteBook(req as AuthRequest, res);
      expect(book.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Book deleted successfully",
      });
    });
  });

  describe("updateBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = {
        params: { id: "bookId" },
        body: { title: "New Title", author: "New Author", note: "New note" },
        user: { _id: "userId" },
      };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 404 if the book is not found", async () => {
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await updateBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await updateBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not authorized to update this book",
      });
    });

    it("should update the book successfully", async () => {
      const book = {
        _id: "bookId",
        title: "Old Title",
        author: "Old Author",
        note: "Old note",
        user: "userId",
        save: jest.fn().mockResolvedValueOnce(true),
      };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await updateBook(req as AuthRequest, res);
      expect(book.title).toEqual("New Title");
      expect(book.author).toEqual("New Author");
      expect(book.note).toEqual("New note");
      expect(book.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(book);
    });
  });

  describe("getBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = { params: { id: "bookId" }, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 404 if the book is not found", async () => {
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await getBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await getBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not authorized to view this book",
      });
    });

    it("should return the book successfully", async () => {
      const book = { _id: "bookId", user: "userId" };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(book);

      await getBook(req as AuthRequest, res);
      expect(res.json).toHaveBeenCalledWith(book);
    });
  });
});
