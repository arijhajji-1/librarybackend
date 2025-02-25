import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../Models/user";

// 📌 Étendre `Request` pour inclure `user`
export interface AuthRequest extends Request {
  user?: any; // ✅ Ajoute la propriété `user` à `Request`
}

// 📌 Middleware de protection JWT
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      req.user = await UserModel.findById(decoded.id).select("-password"); // ✅ Assigne l'utilisateur à `req.user`

      next();
    } catch (error) {
      res.status(401).json({ message: "Accès non autorisé, token invalide" });
    }
  } else {
    res.status(401).json({ message: "Accès non autorisé, aucun token fourni" });
  }
};
