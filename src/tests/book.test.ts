import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { BookModel } from "../Models/book";
import {
  getBooks,
  addBook,
 
} from "../Controllers/bookController";
import type { AuthRequest } from "../middlewares/authMiddleware";

// Mock dependency
jest.mock("../Models/book");

const createResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Book Controllers ", () => {
  describe("getBooks", () => {
    let req: Partial<AuthRequest>;
    let res: Response;
    beforeEach(() => {
      req = { user: { _id: new mongoose.Types.ObjectId() } } as Partial<AuthRequest>;
      res = createResponse();
      jest.clearAllMocks();
    });

    it("returns 401 if user is not authenticated", async () => {
      req.user = undefined;
      await getBooks(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("returns books for the authenticated user", async () => {
      const books = [
        { title: "Book 1", author: "Author 1", pdfUrl: "path/to/pdf", user: req.user ? req.user._id : new mongoose.Types.ObjectId() },
        { title: "Book 2", author: "Author 2", pdfUrl: "path/to/pdf", user: req.user ? req.user._id : new mongoose.Types.ObjectId() },
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
      req = {
        body: { title: "", author: "", note: "" },
        file: {},
        user: { _id: new mongoose.Types.ObjectId() },
      } as Partial<AuthRequest>;
      res = createResponse();
      jest.clearAllMocks();
    });

    it("returns 400 if required fields are missing", async () => {
      req.body = { title: "", author: "Author", note: "A note" };
      await addBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Title, author, and PDF are required",
      });
    });

    it("adds a book successfully", async () => {
      req.body = { title: "Book Title", author: "Author", note: "A note" };
      req.file = { path: "path/to/pdf" } as any; //eslint-disable-line
  
      const bookId = new mongoose.Types.ObjectId();
      // Minimal book mock (cast as any)
      const mockBook = {
        _id: bookId,
        title: req.body.title,
        author: req.body.author,
        note: req.body.note,
        user: req.user ? req.user._id : undefined,
        save: jest.fn(),
      };
     
      (BookModel as unknown as jest.Mock).mockImplementation(() => mockBook);
      await addBook(req as AuthRequest, res);
      expect(mockBook.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBook);
    });
  });

  // Similarly, for deleteBook, updateBook, and getBook, you can apply the minimal
  // approach by using casts (as any) to bypass full IUserDocument or IBookDocument definitions.
});
