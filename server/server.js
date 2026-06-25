import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import postRoutes from "./src/routes/posts.js";
import userRoutes from "./src/routes/users.js";
import messageRoutes from "./src/routes/messages.js";
import notificationRoutes from "./src/routes/notifications.js";
import { socketAuth } from "./src/socket/socketAuth.js";
import { registerSocketHandlers } from "./src/socket/socketHandler.js";

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Attach io to every request so controllers can emit notifications
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

io.use(socketAuth);
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.username}`);
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
