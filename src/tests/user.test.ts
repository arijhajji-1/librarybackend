import type { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { registerUser, loginUser } from "../Controllers/userController";
import {
  addFavoriteBook,
  removeFavoriteBook,
  getFavoriteBooks,
} from "../Controllers/bookController";
import { UserModel } from "../Models/user";
import { BookModel } from "../Models/book";
import type { AuthRequest } from "../middlewares/authMiddleware";

jest.mock("../Models/user");
jest.mock("../Models/book");
jest.mock("jsonwebtoken");

const createResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("User Controllers", () => {
  describe("registerUser", () => {
    let req: Partial<Request>;
    let res: Response;

    beforeEach(() => {
      req = { body: {} };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = { name: "John", email: "john@example.com" };
      await registerUser(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tous les champs sont obligatoires",
      });
    });

    it("should return 400 if user already exists", async () => {
      req.body = {
        name: "John",
        email: "john@example.com",
        password: "123456",
      };
      (UserModel.findOne as jest.Mock).mockResolvedValueOnce({
        email: "john@example.com",
      });

      await registerUser(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cet utilisateur existe déjà",
      });
    });

    it("should register a new user successfully", async () => {
      req.body = {
        name: "John",
        email: "john@example.com",
        password: "123456",
      };
      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        name: "John",
        email: "john@example.com",
        save: jest.fn().mockResolvedValueOnce(true),
      };

      (UserModel as unknown as jest.Mock).mockImplementation(() => mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await registerUser(req as Request, res);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: userId,
        name: "John",
        email: "john@example.com",
      });
    });
  });

  describe("loginUser", () => {
    let req: Partial<Request>;
    let res: Response;

    beforeEach(() => {
      req = { body: {} };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should login successfully if credentials match", async () => {
      req.body = { email: "john@example.com", password: "123456" };
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        name: "John",
        email: "john@example.com",
        matchPassword: jest.fn().mockResolvedValueOnce(true),
      };

      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await loginUser(req as Request, res);
      expect(res.json).toHaveBeenCalledWith({
        _id: userId,
        name: "John",
        email: "john@example.com",
        token: "token123",
      });
    });

    it("should return 401 if credentials are invalid", async () => {
      req.body = { email: "john@example.com", password: "wrongpass" };
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        name: "John",
        email: "john@example.com",
        matchPassword: jest.fn().mockResolvedValueOnce(false),
      };

      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      await loginUser(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email ou mot de passe invalide",
      });
    });
  });

  describe("addFavoriteBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = {
        params: {},
        user: { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011") },
      } as Partial<AuthRequest>;
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;
      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non authentifié",
      });
    });

    it("should return 404 if book is not found", async () => {
      const someBookId = new mongoose.Types.ObjectId();
      req.params = req.params || {};
      req.params.bookId = someBookId.toString();
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Livre non trouvé" });
    });

    it("should return 404 if user is not found", async () => {
      const someBookId = new mongoose.Types.ObjectId();
      req.params = req.params || {};

      req.params.bookId = someBookId.toString();
      (BookModel.findById as jest.Mock).mockResolvedValueOnce({
        _id: someBookId,
      });
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });

    it("should add a book to favorites successfully", async () => {
      const validBookId = new mongoose.Types.ObjectId();
      req.params = req.params || {};

      req.params.bookId = validBookId.toString();
      const mockUser = {
        favorites: [] as mongoose.Types.ObjectId[],
        save: jest.fn().mockResolvedValueOnce(true),
      };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce({
        _id: validBookId,
      });
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await addFavoriteBook(req as AuthRequest, res);
      expect(mockUser.favorites).toContainEqual(validBookId);
      expect(res.json).toHaveBeenCalledWith({
        message: "Livre ajouté aux favoris",
        favorites: mockUser.favorites,
      });
    });
  });

  describe("removeFavoriteBook", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = {
        params: {},
        user: { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011") },
      } as Partial<AuthRequest>;
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;
      await removeFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non authentifié",
      });
    });

    it("should return 404 if user is not found", async () => {
      const someBookId = new mongoose.Types.ObjectId();
      req.params = req.params || {};

      req.params.bookId = someBookId.toString();
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await removeFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });
  });

  describe("getFavoriteBooks", () => {
    let req: Partial<AuthRequest>;
    let res: Response;

    beforeEach(() => {
      req = {
        user: { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011") },
      } as Partial<AuthRequest>;
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;
      await getFavoriteBooks(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non authentifié",
      });
    });

    it("should return 404 if user is not found", async () => {
      (UserModel.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null),
      });
      await getFavoriteBooks(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });

    it("should return favorite books successfully", async () => {
      const favorites = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      (UserModel.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ favorites }),
      });
      await getFavoriteBooks(req as AuthRequest, res);
      expect(res.json).toHaveBeenCalledWith(favorites);
    });
  });
});
