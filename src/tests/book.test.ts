import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test"; // ✅ Ensure testing mode BEFORE importing app

import { app } from "../index"; // Import AFTER setting NODE_ENV
import Book from "../Models/book";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Book.deleteMany();
});

describe("📚 Book API Tests", () => {
  it("✅ Should add a new book", async () => {
    const response = await request(app)
      .post("/api/books/add")
      .field("title", "Test Book")
      .field("author", "John Doe")
      .field("note", "A test note")
      .attach("pdfUrl", Buffer.from("Fake PDF File"), "test.pdf");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe("Test Book");
    expect(response.body.author).toBe("John Doe");
  });

  it("✅ Should fetch the list of books", async () => {
    await Book.create({ title: "Book 1", author: "Author 1", pdfUrl: "/test.pdf" });

    const response = await request(app).get("/api/books");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("✅ Should delete a book", async () => {
    const book = await Book.create({ title: "Book to Delete", author: "Author X", pdfUrl: "/delete.pdf" });

    const response = await request(app).delete(`/api/books/${book._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted successfully");

    const bookExists = await Book.findById(book._id);
    expect(bookExists).toBeNull();
  });

  it("❌ Should return 400 if title, author, or PDF is missing", async () => {
    const response = await request(app).post("/api/books/add").send({
      title: "",
      author: "Unknown",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Title, author, and PDF are required");
  });
});
