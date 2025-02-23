import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookRoutes from "./Routes/bookRoutes";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

if (process.env.NODE_ENV !== "test") { // ✅ Prevents real DB connection in tests
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

app.get("/", (req, res) => {
  res.send("📚 Book Management API is running...");
});

app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {  // ✅ Prevents the server from starting during tests
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
