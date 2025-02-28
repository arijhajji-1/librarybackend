import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookRoutes from "./Routes/bookRoutes";
import userRoutes from "./Routes/userRoutes";
import mongoose from "mongoose";
import { setupSwagger } from "./swagger";
import path from "path";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

if (process.env.NODE_ENV !== "test") {
  const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("✅ MongoDB Connected");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1);
    }
  };
  connectDB();
}

export const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

setupSwagger(app); // ✅ Setup Swagger documentation

app.get("/", (req, res) => {
  res.send("📚 Book Management API is running...");
});

app.use("/api/books", bookRoutes);

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
