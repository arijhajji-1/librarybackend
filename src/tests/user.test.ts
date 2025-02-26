import { type Request, type Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Import your user controllers and model
import {
  registerUser,
  loginUser,
  addFavoriteBook,
  removeFavoriteBook,
  getFavoriteBooks,
} from "../Controllers/userController";
import { UserModel } from "../Models/user";
import type { AuthRequest } from "../middlewares/authMiddleware";

// Mock dependencies
jest.mock("../Models/user");
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
      req.body = { name: "John", email: "john@example.com" }; // missing password
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
      // Simulate that a user is found
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
      // Simulate that no user exists yet
      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      // Create a fake user instance with a save method
      const mockUser = {
        _id: "userId",
        name: "John",
        email: "john@example.com",
        save: jest.fn().mockResolvedValueOnce(true),
      };

      // When a new UserModel is instantiated, return our mockUser
      (UserModel as unknown as jest.Mock).mockImplementation(() => mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await registerUser(req as Request, res);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: "userId",
        name: "John",
        email: "john@example.com",
      });
    });

    it("should handle server errors", async () => {
      req.body = {
        name: "John",
        email: "john@example.com",
        password: "123456",
      };
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockRejectedValueOnce(new Error("Test error")),
      }));
      await registerUser(req as Request, res);
      // Optionally, you can assert error handling here.
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
      const mockUser = {
        _id: "userId",
        name: "John",
        email: "john@example.com",
        matchPassword: jest.fn().mockResolvedValueOnce(true),
      };

      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await loginUser(req as Request, res);
      expect(res.json).toHaveBeenCalledWith({
        _id: "userId",
        name: "John",
        email: "john@example.com",
        token: "token123",
      });
    });

    it("should return 401 if credentials are invalid", async () => {
      req.body = { email: "john@example.com", password: "wrongpass" };
      const mockUser = {
        _id: "userId",
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
      req = { body: {}, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 400 if bookId is invalid", async () => {
      req.body = { bookId: "invalidId" };
      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID du livre invalide",
      });
    });

    it("should return 401 if user is not found", async () => {
      req.body = { bookId: new mongoose.Types.ObjectId().toString() };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });

    it("should return 400 if the book is already in favorites", async () => {
      const validBookId = new mongoose.Types.ObjectId().toString();
      req.body = { bookId: validBookId };
      const mockUser = {
        favorites: [validBookId],
        save: jest.fn().mockResolvedValueOnce(true),
      };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await addFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Livre déjà ajouté aux favoris",
      });
    });

    it("should add a book to favorites successfully", async () => {
      const validBookId = new mongoose.Types.ObjectId().toString();
      req.body = { bookId: validBookId };
      const mockUser = {
        favorites: [] as string[],
        save: jest.fn().mockResolvedValueOnce(true),
      };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await addFavoriteBook(req as AuthRequest, res);
      expect(mockUser.favorites).toContain(validBookId);
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
      req = { body: {}, user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 401 if user is not found", async () => {
      req.body = { bookId: "someBookId" };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await removeFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });

    it("should return 400 if the book is not in favorites", async () => {
      req.body = { bookId: "someBookId" };
      const mockUser = { favorites: [] as string[], save: jest.fn() };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await removeFavoriteBook(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Livre non trouvé dans les favoris",
      });
    });

    it("should remove a favorite book successfully", async () => {
      req.body = { bookId: "someBookId" };
      const mockUser = {
        favorites: ["someBookId", "anotherBookId"],
        save: jest.fn().mockResolvedValueOnce(true),
      };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await removeFavoriteBook(req as AuthRequest, res);
      expect(mockUser.favorites).not.toContain("someBookId");
      expect(res.json).toHaveBeenCalledWith({
        message: "Livre supprimé des favoris",
        favorites: mockUser.favorites,
      });
    });
  });

  describe("getFavoriteBooks", () => {
    let req: Partial<AuthRequest>;
    let res: Response;
    beforeEach(() => {
      req = { user: { _id: "userId" } };
      res = createResponse();
      jest.clearAllMocks();
    });

    it("should return 401 if user is not found", async () => {
      (UserModel.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null),
      });
      await getFavoriteBooks(req as AuthRequest, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
    });

    it("should return favorite books successfully", async () => {
      const mockUser = {
        favorites: ["book1", "book2"],
        populate: jest.fn().mockResolvedValueOnce({ favorites: ["book1", "book2"] }),
      };
      (UserModel.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockUser),
      });
      await getFavoriteBooks(req as AuthRequest, res);
      expect(res.json).toHaveBeenCalledWith(mockUser.favorites);
    });
  });
});
