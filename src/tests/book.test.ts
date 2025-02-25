// book.test.ts
import { Response } from "express";

// Import your book controllers and model
import {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
  getBook,
} from "../Controllers/bookController";
import Book from "../Models/book";

// Mock dependencies
jest.mock("../Models/book");

const createResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Book Controllers", () => {
  describe("getBooks", () => {
    let req: any;
    let res: Response;

    beforeEach(() => {
      req = { user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return the list of books for the user", async () => {
      const books = [{ _id: "book1" }, { _id: "book2" }];
      (Book.find as jest.Mock).mockResolvedValueOnce(books);

      await getBooks(req, res);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("should handle server errors", async () => {
      (Book.find as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

      await getBooks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("addBook", () => {
    let req: any;
    let res: Response;

    beforeEach(() => {
      req = { body: {}, file: {}, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = { title: "Book Title", author: "Author" };
      req.file = null;

      await addBook(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Title, author, and PDF are required",
      });
    });

    it("should add a book successfully", async () => {
      req.body = { title: "Book Title", author: "Author", note: "A note" };
      req.file = { path: "path/to/pdf" };

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

      (Book as any).mockImplementation(() => mockBook);

      await addBook(req, res);
      expect(mockBook.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBook);
    });

    it("should handle server errors", async () => {
      req.body = { title: "Book Title", author: "Author", note: "A note" };
      req.file = { path: "path/to/pdf" };

      (Book as any).mockImplementation(() => ({
        save: jest.fn().mockRejectedValueOnce(new Error("Test error")),
      }));

      await addBook(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("deleteBook", () => {
    let req: any;
    let res: Response;

    beforeEach(() => {
      req = { params: { id: "bookId" }, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 404 if the book is not found", async () => {
      (Book.findById as jest.Mock).mockResolvedValueOnce(null);

      await deleteBook(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await deleteBook(req, res);
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
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await deleteBook(req, res);
      expect(book.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Book deleted successfully",
      });
    });

    it("should handle server errors", async () => {
      (Book.findById as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      await deleteBook(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("updateBook", () => {
    let req: any;
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
      (Book.findById as jest.Mock).mockResolvedValueOnce(null);

      await updateBook(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await updateBook(req, res);
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
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await updateBook(req, res);
      expect(book.title).toEqual("New Title");
      expect(book.author).toEqual("New Author");
      expect(book.note).toEqual("New note");
      expect(book.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it("should handle server errors", async () => {
      (Book.findById as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      await updateBook(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("getBook", () => {
    let req: any;
    let res: Response;

    beforeEach(() => {
      req = { params: { id: "bookId" }, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 404 if the book is not found", async () => {
      (Book.findById as jest.Mock).mockResolvedValueOnce(null);

      await getBook(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 403 if the user is not the owner", async () => {
      const book = { user: "otherUserId" };
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await getBook(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not authorized to view this book",
      });
    });

    it("should return the book successfully", async () => {
      const book = { _id: "bookId", user: "userId" };
      (Book.findById as jest.Mock).mockResolvedValueOnce(book);

      await getBook(req, res);
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it("should handle server errors", async () => {
      (Book.findById as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      await getBook(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });
});
