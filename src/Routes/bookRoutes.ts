import express from "express";
import { getBooks, deleteBook, addBook } from "../Controllers/bookController";
import upload from "../middlewares/uploadMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     description: Fetch a list of all books in the library.
 *     responses:
 *       200:
 *         description: List of books
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
 */
router.get("/", getBooks);

/**
 * @swagger
 * /api/books/add:
 *   post:
 *     summary: Add a new book
 *     description: Upload a new book with a PDF file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *         description: Book added successfully
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
 */
router.post("/add", upload.single("pdfUrl"), addBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Remove a book from the collection using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "650f1e7a2d7a7a0d88b10b2a"
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete("/:id", deleteBook);

export default router;
