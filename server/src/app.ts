// server/src/app.ts
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import http from "http";

import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import chatsRouter from "./routes/chats";
import { initSocketServer } from "./realtime/socketManager";
import uploadsRouter from "./routes/uploads";
import multer from "multer";

const app = express();

// MODE
const isDevelopment = process.env.NODE_ENV !== "production";
const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID);
const isProduction = !isDevelopment || isRailway;

// ---- CORS ----
const allowedOriginsList = [
  "https://darling-torrone-5e5797.netlify.app",
  "https://bilidamarket.com",
  "https://www.bilidamarket.com",
  "http://localhost:5173",
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((x) => x.trim()) || []),
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!isProduction) return callback(null, true);
    if (!origin) return callback(null, true);

    if (allowedOriginsList.includes(origin)) return callback(null, true);
    console.log("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("tiny"));

// 간단한 헬스체크 (API 라우트보다 먼저)
app.get("/health", (_req, res) => {
  return res.json({ ok: true, uptime: process.uptime() });
});

// rate limiter를 API 전체에 적용
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 200, // 1분당 요청 수
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API 라우트 (먼저 등록)
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/uploads", uploadsRouter);

// Multer / upload-related errors -> return JSON instead of crashing
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  if (err && err.message && /Unexpected field/i.test(err.message)) {
    return res.status(400).json({ ok: false, error: "unexpected_field" });
  }
  // fallback: log and return generic error
  if (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
  return;
});

// ---------------------------
// 프론트엔드 서빙 (마지막에 등록)
// ---------------------------
if (isProduction) {
  const clientPath = path.join(__dirname, "../../client/dist");
  console.log("📦 Serving frontend from:", clientPath);

  app.use(express.static(clientPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Not Found" });
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ---- Start Server ----
const server = http.createServer(app);
const socketAllowedOrigins = !isProduction ? true : allowedOriginsList;

initSocketServer(server, socketAllowedOrigins);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");

    const port = Number(process.env.PORT) || 4000;
    server.listen(port, "0.0.0.0", () => {
      console.log("=================================");
      console.log("🚀 Server started successfully!");
      console.log("Mode:", isProduction ? "Production" : "Development");
      console.log("PORT:", port);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();

export default app;
