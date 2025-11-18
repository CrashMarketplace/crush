// server/src/app.ts
import dotenv from "dotenv";
dotenv.config(); // ⬅️ 전역에서 단 한 번만 로드. 가장 위에 있어야 함!

import path from "path";
import http from "http";

import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import chatsRouter from "./routes/chats";
import { initSocketServer } from "./realtime/socketManager";

const app = express();

// 환경 감지
const isDevelopment = process.env.NODE_ENV !== "production";

// Railway 환경인지 감지
const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_NAME ||
    process.env.RAILWAY_DEPLOYMENT_ID
);

const isProduction = !isDevelopment || isRailway;

// CORS 기본 도메인
const defaultDomains = [
  "https://darling-torrone-5e5797.netlify.app",
  "https://bilidamarket.com",
  "http://bilidamarket.com",
  "https://www.bilidamarket.com",
  "http://www.bilidamarket.com",
];

const envDomains = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((d) => d.trim())
  : [];

const allowedOriginsList = [...new Set([...defaultDomains, ...envDomains])];

// CORS 설정
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!isProduction) return callback(null, true);
    if (!origin) return callback(null, true);

    if (allowedOriginsList.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 업로드 파일 정적 서빙
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 헬스 체크
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API 라우트
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chats", chatsRouter);

// ---------------------------
// 프론트엔드 서빙 (프로덕션)
// ---------------------------
if (isProduction) {
  const clientPath = path.join(__dirname, "../../client/dist");
  console.log("📦 Serving frontend from:", clientPath);

  app.use(express.static(clientPath));

  app.get(/.*/, (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Not Found" });
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ---------------------------
// 서버 실행
// ---------------------------
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
