// server/src/app.ts
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
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

// ⭐ Railway / Proxy 환경에서 반드시 필요
app.set("trust proxy", 1);

// MODE
const isDevelopment = process.env.NODE_ENV !== "production";
const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID);
const isProduction = !isDevelopment || isRailway;

// 🔥 [수정] Vercel 배포 도메인 추가 (CORS 및 소켓 허용)
const allowedOriginsList = [
  "https://bilidamarket.com",
  "https://www.bilidamarket.com",
  "http://localhost:5173",
  "https://crush-git-main-0608s-projects.vercel.app",
  "https://crush-2et7g8ny6-0608s-projects.vercel.app",
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((x) => x.trim()) || []),
];

// ---- CORS ----
// 🔥 [수정] 배포 환경 통신 문제 해결을 위한 강력한 CORS 설정
const corsOptions: CorsOptions = {
  origin: true, // 요청한 Origin을 그대로 반환 (모든 도메인 허용 효과)
  credentials: true, // 쿠키/인증정보 허용
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🔥 [수정] Helmet 설정: 타 도메인 이미지 로딩 허용
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 🔥 [추가] 요청 로그 미들웨어 (서버 도달 여부 확인용)
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.path} | Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

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

// ---- 정적 파일 서빙 ----
const uploadsPath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../uploads");

// 🔥 [수정] 업로드 폴더 자동 생성 (로그 추가)
if (!fs.existsSync(uploadsPath)) {
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`✅ Created uploads directory: ${uploadsPath}`);
  } catch (e) {
    console.error("❌ Failed to create uploads directory:", e);
  }
} else {
  console.log(`✅ Uploads directory exists: ${uploadsPath}`);
}

// CORS 헤더 for uploads
const uploadsCorsMiddleware = (req: any, res: any, next: any) => {
  // 이미지 로딩 차단 방지
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  
  const origin = req.get("Origin");
  // 🔥 [수정] 이미지 요청도 모든 Origin 허용 (이미지 엑박 방지)
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // 브라우저 직접 접속 등을 위해 * 허용 고려 가능하나, credentials 이슈로 origin 반사가 안전
    res.setHeader("Access-Control-Allow-Origin", "*");
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
app.use(uploadsCorsMiddleware, express.static(uploadsPath));

// ---- API Routes ----
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/upload", uploadsRouter);

// Error Handlers
app.use((err: any, req: any, res: any, next: any) => {
  if (!err) return next();
  console.error("Global error handler:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  return res.status(500).json({ ok: false, error: "internal_error" });
});

// ---- Frontend Serve (Production) ----
if (isProduction) {
  const clientPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientPath));
  app.use((req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "API Not Found" });
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ---- Start Server ----
const server = http.createServer(app);

// 🔥 [수정] Vercel 프론트엔드 접속 허용 (Socket.IO)
const socketAllowedOrigins = true; 

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
      console.log("Security: CORS Origin=TRUE (Permissive)");
      console.log("PORT:", port);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();

export default app;
