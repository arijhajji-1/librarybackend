import express from "express";
import {
  registerUser,
  loginUser,
  addFavoriteBook,
  removeFavoriteBook,
  getFavoriteBooks,
} from "../Controllers/userController";
import { protect } from "../middlewares/authMiddleware"; // ✅ Protection avec JWT

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs (inscription et connexion)
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     description: Crée un compte utilisateur en fournissant un nom, un email et un mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65d2f7..."
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 token:
 *                   type: string
 *                   example: "eyJhbG..."
 *       400:
 *         description: L'utilisateur existe déjà ou données invalides
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Utilisateurs]
 *     description: Connecte un utilisateur avec email et mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65d2f7..."
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 token:
 *                   type: string
 *                   example: "eyJhbG..."
 *       401:
 *         description: Identifiants invalides
 */

router.post("/register", registerUser);

router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/favorites/add:
 *   post:
 *     summary: Ajouter un livre aux favoris
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 example: "6510f1e7b4c8d3e7a0d8b10b"
 *     responses:
 *       200:
 *         description: Livre ajouté aux favoris
 *       400:
 *         description: Livre déjà dans les favoris
 *       404:
 *         description: Livre non trouvé
 *       401:
 *         description: Accès non autorisé
 */
router.post("/favorites/add", protect, addFavoriteBook);

/**
 * @swagger
 * /api/users/favorites/remove:
 *   post:
 *     summary: Supprimer un livre des favoris
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 example: "6510f1e7b4c8d3e7a0d8b10b"
 *     responses:
 *       200:
 *         description: Livre supprimé des favoris
 *       401:
 *         description: Accès non autorisé
 */
router.post("/favorites/remove", protect, removeFavoriteBook);

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: Récupérer les livres favoris
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des livres favoris
 *       401:
 *         description: Accès non autorisé
 */
router.get("/favorites", protect, getFavoriteBooks);

export default router;
