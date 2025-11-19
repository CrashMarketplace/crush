import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// ----------- 업로드 디렉토리 생성 (Railway에서도 정상) -----------
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads 폴더 생성됨:", uploadDir);
}

// ----------- Multer 설정 -----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base || "image"}-${unique}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp|bmp)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB, 5장
});

// ----------- 절대 URL 계산 함수 (Railway 완벽 대응) -----------
function getBaseUrl(req: Request) {
  // 💡 1. .env에서 직접 지정한 값이 있으면 항상 우선
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  // 💡 2. x-forwarded-proto/host (Railway 프록시)
  const proto =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host");

  return `${proto}://${host}`;
}

// ----------- API: 이미지 업로드 -----------
router.post(
  "/images",
  upload.array("files", 5),
  (req: Request, res: Response) => {
    const user = readUserFromReq(req);
    if (!user)
      return res.status(401).json({ ok: false, error: "unauthorized" });

    const files =
      (req as Request & { files?: Express.Multer.File[] }).files ?? [];

    const base = getBaseUrl(req); // 절대 URL
    const urls = files.map((f) => `${base}/uploads/${path.basename(f.path)}`);

    return res.status(201).json({ ok: true, urls });
  }
);

export default router;
