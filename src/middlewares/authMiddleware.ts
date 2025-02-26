import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import {UserModel } from "../Models/user";
import type { IUserDocument } from "../Types/user";

// Define the shape of the decoded JWT payload.
interface DecodedToken {
  id: string;
  iat?: number;
  exp?: number;
}

// Extend Request so it includes our custom user type.
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// JWT protection middleware
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      // Extract the token
      token = req.headers.authorization.split(" ")[1];
      // Verify the token and cast it to our DecodedToken interface.
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;

      // Find the user by ID and assign it to req.user.
      // Casting here ensures the result conforms to our IUser interface.
      req.user = (await UserModel.findById(decoded.id).select("-password")) as unknown as IUserDocument;

      next();
    } catch {
      res.status(401).json({ message: "Accès non autorisé, token invalide" });
    }
  } else {
    res.status(401).json({ message: "Accès non autorisé, aucun token fourni" });
  }
};
