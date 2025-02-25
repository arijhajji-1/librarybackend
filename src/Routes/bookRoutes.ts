import express from "express";
import { getBooks, deleteBook, addBook,updateBook } from "../Controllers/bookController";
import upload from "../middlewares/uploadMiddleware";
import { protect } from "../middlewares/authMiddleware"; // ✅ Protection avec JWT

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Livres
 *   description: Gestion des livres de la bibliothèque
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Récupérer les livres de l'utilisateur
 *     tags: [Livres]
 *     description: Retourne la liste des livres appartenant à l'utilisateur connecté.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des livres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "650f1e7a2d7a7a0d88b10b2a"
 *                   title:
 *                     type: string
 *                     example: "The Great Gatsby"
 *                   author:
 *                     type: string
 *                     example: "F. Scott Fitzgerald"
 *                   pdfUrl:
 *                     type: string
 *                     example: "/uploads/gatsby.pdf"
 *                   user:
 *                     type: string
 *                     example: "65d2f7..."
 */
router.get("/", protect, getBooks);

/**
 * @swagger
 * /api/books/add:
 *   post:
 *     summary: Ajouter un nouveau livre
 *     tags: [Livres]
 *     description: Upload un livre et l'associe à l'utilisateur connecté.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - pdfUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: "1984"
 *               author:
 *                 type: string
 *                 example: "George Orwell"
 *               note:
 *                 type: string
 *                 example: "Dystopian classic"
 *               pdfUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Livre ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6510f1e7b4c8d3e7a0d8b10b"
 *                 title:
 *                   type: string
 *                   example: "1984"
 *                 author:
 *                   type: string
 *                   example: "George Orwell"
 *                 note:
 *                   type: string
 *                   example: "Dystopian classic"
 *                 pdfUrl:
 *                   type: string
 *                   example: "/uploads/1984.pdf"
 *                 user:
 *                   type: string
 *                   example: "65d2f7..."
 */
router.post("/add", upload.single("pdfUrl"), protect, addBook);

/**
 * @swagger
 * /api/books/update/{id}:
 *   put:
 *     summary: Mettre à jour un livre
 *     tags: [Livres]
 *     description: Mettre à jour un livre appartenant à l'utilisateur connecté.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du livre à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "1984 - Nouvelle Édition"
 *               author:
 *                 type: string
 *                 example: "George Orwell"
 *               note:
 *                 type: string
 *                 example: "Version mise à jour du livre classique"
 *               pdfUrl:
 *                 type: string
 *                 example: "/uploads/1984-updated.pdf"
 *     responses:
 *       200:
 *         description: Livre mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6510f1e7b4c8d3e7a0d8b10b"
 *                 title:
 *                   type: string
 *                   example: "1984 - Nouvelle Édition"
 *                 author:
 *                   type: string
 *                   example: "George Orwell"
 *                 note:
 *                   type: string
 *                   example: "Version mise à jour du livre classique"
 *                 pdfUrl:
 *                   type: string
 *                   example: "/uploads/1984-updated.pdf"
 *       400:
 *         description: Données invalides ou champs manquants
 *       401:
 *         description: Accès non autorisé, l'utilisateur doit être connecté
 *       403:
 *         description: L'utilisateur n'a pas le droit de modifier ce livre
 *       404:
 *         description: Livre non trouvé
 */
router.put("/update/:id", protect, updateBook);

/**
 * @swagger
 * /api/books/delete/{id}:
 *   delete:
 *     summary: Supprimer un livre
 *     tags: [Livres]
 *     description: Supprime un livre appartenant à l'utilisateur connecté.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du livre à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Livre supprimé avec succès
 *       401:
 *         description: Accès non autorisé, l'utilisateur doit être connecté
 *       403:
 *         description: L'utilisateur n'a pas le droit de supprimer ce livre
 *       404:
 *         description: Livre non trouvé
 */
router.delete("/delete/:id", protect, deleteBook);


export default router;
