import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

// CORS 설정
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

// 헬스 체크
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 라우터
app.use('/api/auth', authRouter);

// MongoDB 연결 및 서버 실행
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");

    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST ?? "0.0.0.0";

    app.listen(port, host, () => {
      console.log(`Server running at http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
  }
})();
