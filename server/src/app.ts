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

// Railway면 프로덕션 모드 취급
const isProduction = !isDevelopment || isRailway;

// 기본 허용 도메인
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

// CORS 옵션
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!isProduction) {
      callback(null, true);
      return;
    }

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOriginsList.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS BLOCKED: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 정적 업로드 파일
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 헬스체크
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// API 라우트
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chats", chatsRouter);


// -------------------------------------------
// 🚀 **프론트엔드 서빙 (Express 5 + Railway 경로 완전 해결본)**
// -------------------------------------------

if (isProduction) {
  // ⬅️ 핵심: process.cwd() 절대 사용 X
  // dist/app.js 기준으로 client/dist 찾기
  const clientPath = path.join(__dirname, "../../client/dist");
  console.log("📦 Serving frontend from:", clientPath);

  // 정적 파일 서빙
  app.use(express.static(clientPath));

  // SPA fallback — Express 5에서 "*" 사용 불가 → 정규식 사용
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Not Found" });
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  // 개발 환경 안내 메시지
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Not Found" });
    }
    res.json({
      message: "Client not served by backend in development mode.",
      tip: "Run `npm run dev` inside client directory.",
    });
  });
}


// -------------------------------------------
// 🚀 서버 실행
// -------------------------------------------

const server = http.createServer(app);

// Socket.io 허용 origin
const socketAllowedOrigins = !isProduction ? true : allowedOriginsList;
initSocketServer(server, socketAllowedOrigins);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");

    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST ?? "0.0.0.0";

    server.listen(port, host, () => {
      console.log("\n=================================");
      console.log("🚀 Server started successfully!");
      console.log("Mode:", isProduction ? "Production" : "Development");
      console.log("PORT:", port);
      console.log("=================================\n");
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();

export default app;
