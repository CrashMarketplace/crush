import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// 업로드 디렉토리 설정 (환경변수 우선)
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // 잘못된 타입은 명시적 에러로 처리
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

// POST /images - accept any file field(s) and return uploaded URL(s)
router.post("/images", (req, res) => {
  upload.any()(req as any, res as any, (err: any) => {
    // 업로드 실패 시, 이미 저장된 파일이 있으면 정리
    const filesInReq = (req as any).files as Express.Multer.File[] | undefined;
    if (err) {
      if (filesInReq && filesInReq.length) {
        for (const f of filesInReq) {
          try {
            fs.unlinkSync(path.join(uploadsDir, f.filename));
          } catch (_e) {
            /* ignore */
          }
        }
      }
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ ok: false, error: err.message });
      }
      return res.status(400).json({ ok: false, error: err.message || "upload_failed" });
    }

    const files = filesInReq;
    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: "no_files_uploaded" });
    }

    const urls = files.map((f) => `/uploads/${f.filename}`);
    return res.json({ ok: true, urls, url: urls.length === 1 ? urls[0] : undefined });
  });
});

export default router;
