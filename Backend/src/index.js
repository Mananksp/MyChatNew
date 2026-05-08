import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import { app, server } from "./lib/socket.js";
import { scheduleCleanup } from "./lib/cleanup.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// enable CORS for the frontend (must be registered BEFORE any body parsers)
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "cookie",
    ],
    exposedHeaders: ["Set-Cookie"], // ✅ EXPOSE Set-Cookie header so browser can read it
  }),
);

// body size limits: increase to allow base64 image payloads
// increase limits for images/files sent as base64 in JSON (adjust if needed)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Note: using only the `cors` middleware above ensures preflight and
// standard CORS headers are set. Avoid duplicating headers manually.

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Redirect root server URL to frontend login page (useful when opening localhost:5000 in browser)
app.get("/", (req, res) => {
  const loginUrl = `${CLIENT_ORIGIN}/login`;
  return res.redirect(loginUrl);
});

if (process.env.NODE_ENV === "production") {
  // Backend only serves API in production
  // Frontend is deployed separately on Render
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();

  // Schedule automatic cleanup of old messages (runs every 24 hours + initial run after 5 seconds)
  scheduleCleanup();
});
