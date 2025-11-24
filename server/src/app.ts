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
import multer from "multer";

import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import chatsRouter from "./routes/chats";
import { initSocketServer } from "./realtime/socketManager";
import uploadsRouter from "./routes/uploads";

const app = express();

// ⭐ Railway / Proxy 환경에서 반드시 필요 (express-rate-limit 오류 방지)
app.set("trust proxy", 1);

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

    // 🔥 Vercel 배포 도메인 허용 (모든 vercel.app 서브도메인)
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // 🔥 Netlify Deploy Preview 허용 (기존 호환성 유지)
    if (origin.endsWith("--darling-torrone-5e5797.netlify.app")) {
      return callback(null, true);
    }

    console.log("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🔥 [수정] Helmet 설정 변경: 타 도메인(Vercel)에서 이미지 로딩 허용 (ERR_BLOCKED_BY_RESPONSE 해결)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(morgan("tiny"));

// Health check
app.get("/health", (_req, res) => {
  return res.json({ ok: true, uptime: process.uptime() });
});

// ---- Rate Limit ----
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ---- 정적 파일 서빙 (환경변수 UPLOADS_DIR 우선)
const uploadsPath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../uploads");

// CORS 헤더 for uploads: set explicit origin in production (needed if requests include credentials)
const uploadsCorsMiddleware = (req: any, res: any, next: any) => {
  const origin = req.get("Origin");
  if (!origin) {
    // no origin header (same-origin or direct file access)
    return next();
  }

  if (!isProduction) {
    // during development allow all origins
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // in production only allow origins listed in allowedOriginsList
    if (allowedOriginsList.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      // if frontend sends credentials, allow them too
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      // do not set Access-Control-Allow-Origin -> browser will block
      // or respond without CORS header to indicate not allowed
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Vary", "Origin");
  next();
};

app.use("/uploads", uploadsCorsMiddleware, express.static(uploadsPath));
app.use(express.static(uploadsPath));

// ---- API Routes ----
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/uploads", uploadsRouter);
// keep legacy mount but forward to uploads router
app.use("/api/upload", uploadsRouter);

// Multer / upload-related errors -> return JSON instead of crashing
app.use((err: any, req: any, res: any, next: any) => {
  if (!err) return next();
  console.error("Global error handler - path:", req.path, "headers:", {
    origin: req.get("origin"),
    "content-type": req.get("content-type"),
  });
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  if (err && typeof err.message === "string" && /Unexpected field/i.test(err.message)) {
    return res.status(400).json({
      ok: false,
      error: "unexpected_field",
      message:
        "Use field name 'image' or 'images' (or 'file', 'files') in the multipart/form-data request.",
    });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ ok: false, error: "internal_error" });
});

// ---- Frontend Serve (Production) ----
if (isProduction) {
  const clientPath = path.join(__dirname, "../../client/dist");
  console.log("📦 Serving frontend from:", clientPath);

  app.use(express.static(clientPath));

  app.use((req, res) => {
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
      console.log("Security: Cross-Origin Resource Policy enabled"); // 🔥 적용 확인용 로그
      console.log("PORT:", port);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();

export default app;
