import express from "express";
import { getBooks, deleteBook, addBook } from "../Controllers/bookController";
import upload from "../middlewares/uploadMiddleware"; // Create this middleware

const router = express.Router();

router.get("/", getBooks);
router.post("/add", upload.single("pdfUrl"), addBook);
router.delete("/:id", deleteBook);

export default router;
