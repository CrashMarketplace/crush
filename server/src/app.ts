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

// 기존 라우터
import authRouter from "./routes/auth";
// 새 라우터 추가
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import chatsRouter from "./routes/chats";
import { initSocketServer } from "./realtime/socketManager";

const app = express();

// CORS 설정 — 개발 환경에서는 모든 origin 허용
const isDevelopment = process.env.NODE_ENV !== "production";

// 프로덕션 도메인 설정
const getAllowedOrigins = (): string[] | true => {
  if (isDevelopment) {
    return true; // 개발 환경: 모든 origin 허용
  }
  
  // 프로덕션: 환경 변수에서 도메인 가져오기
  const domains = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((d) => d.trim())
    : [];
  
  // 기본 도메인 추가
  const defaultDomains = [
    "https://darling-torrone-5e5797.netlify.app",
    "https://bilidamarket.com",
    "http://bilidamarket.com",
    "https://www.bilidamarket.com",
    "http://www.bilidamarket.com",
  ];
  
  // 중복 제거 및 병합
  const allDomains = [...new Set([...defaultDomains, ...domains])];
  return allDomains;
};

const allowedOrigins = getAllowedOrigins();

// CORS 미들웨어 설정 - cors 패키지 사용
// ⚠️ 중요: 모든 요청(정적 파일 포함)에 CORS 헤더를 적용하기 위해 가장 먼저 설정
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 개발 환경: 모든 origin 허용
    if (allowedOrigins === true) {
      callback(null, true);
      return;
    }
    
    // origin이 없는 경우 (같은 도메인 요청, Postman 등) 허용
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // 프로덕션: 허용된 origin만
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS 차단된 origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // 쿠키 포함 요청 허용
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cookie", // 쿠키 헤더 명시적 허용
  ],
  exposedHeaders: ["Set-Cookie"], // 클라이언트에서 읽을 수 있는 헤더
  maxAge: 86400, // 24시간 (preflight 캐시)
  preflightContinue: false, // preflight 요청을 다음 미들웨어로 전달하지 않음
  optionsSuccessStatus: 204, // OPTIONS 요청 성공 상태 코드
};

// CORS 미들웨어 적용 (모든 요청에 대해)
// cors 미들웨어가 자동으로 OPTIONS 요청을 처리하므로 별도로 app.options()를 호출할 필요 없음
app.use(cors(corsOptions));

// 바디/쿠키
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// 업로드 파일 정적 제공 (/uploads/파일명 으로 접근)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 헬스체크
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 1. API 라우트 (가장 먼저)
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chats", chatsRouter);

// 2. 정적 파일 (프로덕션 환경에서만)
if (!isDevelopment) {
  const clientBuildPath = path.join(process.cwd(), "..", "client", "dist");
  app.use(express.static(clientBuildPath));
  
  // 3. SPA catch-all (맨 마지막)
  app.use((req, res) => {
    // API 요청에 대해서는 JSON으로 404 반환
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not Found" });
    }
    // 그 외의 요청은 SPA HTML 반환
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // 개발 환경: API 404는 JSON으로 반환, 그 외는 안내 메시지
  app.use((req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ 
        error: "Not Found",
        message: `API endpoint '${req.path}' not found`,
        method: req.method
      });
    }
    // 개발 환경에서는 클라이언트가 별도로 실행되므로 안내 메시지
    res.status(404).json({ 
      error: "Not Found",
      message: "This is the API server. The client should be running separately.",
      tip: "In development, run the client with 'npm run dev' in the client directory"
    });
  });
}

const server = http.createServer(app);
initSocketServer(server, allowedOrigins);

(async () => {
  try {
    // ⚠️ .env 키 이름 확인: 현재 코드는 MONGO_URI 사용
    // 예: MONGO_URI=mongodb://127.0.0.1:27017/krush
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");

    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST ?? "0.0.0.0";

    server.listen(port, host, () => {
      // 로컬 IP 주소 찾기
      const networkInterfaces = os.networkInterfaces();
      const localIPs: string[] = [];
      
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
          for (const iface of interfaces) {
            // IPv4이고 내부 주소가 아닌 경우만 (127.0.0.1 제외)
            // Node.js 버전에 따라 family가 'IPv4' 문자열이거나 4 숫자일 수 있음
            const family = iface.family as string | number;
            const isIPv4 = family === "IPv4" || family === 4;
            if (isIPv4 && !iface.internal) {
              localIPs.push(iface.address);
            }
          }
        }
      }

      console.log("\n" + "=".repeat(50));
      console.log("🚀 서버가 시작되었습니다!");
      console.log("=".repeat(50));
      
      if (isDevelopment) {
        // 개발 환경
        console.log(`📍 로컬 접속: http://127.0.0.1:${port}`);
        
        if (localIPs.length > 0) {
          console.log("\n🌐 네트워크 접속 주소:");
          localIPs.forEach((ip) => {
            console.log(`   http://${ip}:${port}`);
          });
          console.log("\n💡 다른 기기에서 접근하려면 위 주소 중 하나를 사용하세요.");
          console.log("   (같은 Wi-Fi 네트워크에 연결되어 있어야 합니다)");
        } else {
          console.log("\n⚠️  로컬 네트워크 IP를 찾을 수 없습니다.");
          console.log("   터미널에서 'ifconfig' (macOS/Linux) 또는 'ipconfig' (Windows)를 실행하여 IP 주소를 확인하세요.");
        }
      } else {
        // 프로덕션 환경
        console.log(`📍 서버 포트: ${port}`);
        if (allowedOrigins !== true && Array.isArray(allowedOrigins)) {
          console.log("\n🌐 허용된 도메인:");
          allowedOrigins.forEach((origin) => {
            console.log(`   ${origin}`);
          });
        }
        console.log("\n💡 프로덕션 모드로 실행 중입니다.");
        console.log("   클라이언트 정적 파일이 서버에서 서빙됩니다.");
      }
      
      console.log("=".repeat(50) + "\n");
    });
  } catch (err) {
    console.error("Server startup failed:", err);
  }
})();

export default app;
