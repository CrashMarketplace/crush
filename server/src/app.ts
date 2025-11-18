// server/src/app.ts
import path from "path";
import http from "http";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import os from "os";

// Routers
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import chatsRouter from "./routes/chats";
import { initSocketServer } from "./realtime/socketManager";

const app = express();

// 환경 체크
const isRailway =
  Boolean(process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_NAME ||
  process.env.RAILWAY_DEPLOYMENT_ID);

const isProduction = isRailway || process.env.NODE_ENV === "production";

// ▽ CORS 설정
const defaultDomains = [
  "https://darling-torrone-5e5797.netlify.app",
  "https://bilidamarket.com",
  "http://bilidamarket.com",
  "https://www.bilidamarket.com",
  "http://www.bilidamarket.com",
];

const envDomains = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((d) => d.trim()).filter(Boolean)
  : [];

const allowedOriginsList = [...new Set([...defaultDomains, ...envDomains])];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!isProduction) return callback(null, true); // 개발: 모두 허용
    if (!origin) return callback(null, true); // 서버 간 요청 허용
    if (allowedOriginsList.includes(origin)) return callback(null, true);

    console.warn(`❌ CORS BLOCKED: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// ▽ Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 업로드 파일 라우트
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chats", chatsRouter);

// ▽ 프론트엔드 정적 파일 서빙 (Railway에서도 true)
if (isProduction) {
  const clientPath = path.join(process.cwd(), "..", "client", "dist");
  console.log("📦 Serving frontend from:", clientPath);

  app.use(express.static(clientPath));

  // SPA fallback
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not Found" });
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  // 개발 환경 (프론트 별도 실행)
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Not Found" });
    }
    res.json({
      message: "Frontend is not served by the server in development.",
      run: "npm run dev inside client/",
    });
  });
}

// ▽ 서버 + 소켓 시작
const server = http.createServer(app);
const socketAllowedOrigins = !isProduction ? true : allowedOriginsList;
initSocketServer(server, socketAllowedOrigins);

// ▽ DB 연결 & 서버 시작
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB Connected");

    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST ?? "0.0.0.0";

    server.listen(port, host, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 MODE: ${isProduction ? "Production" : "Development"}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();

export default app;
