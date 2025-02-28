import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../Models/user";
import type { IUserDocument } from "../Types/user";

interface DecodedToken {
  id: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// JWT protection middleware
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      req.user = (await UserModel.findById(decoded.id).select(
        "-password",
      )) as unknown as IUserDocument;

      next();
    } catch {
      res.status(401).json({ message: "Accès non autorisé, token invalide" });
    }
  } else {
    res.status(401).json({ message: "Accès non autorisé, aucun token fourni" });
  }
};
