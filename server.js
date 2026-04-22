import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import toolRoutes from "./routes/toolRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/processed", express.static("processed"));

app.use("/api/auth", authRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
