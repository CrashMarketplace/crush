import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// 업로드 디렉토리 설정 (환경변수 우선)
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정 (single file: 'image')
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
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only images are allowed."));
  },
});

// POST /images - single file under form field 'image'
router.post("/images", upload.single("image"), (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ ok: false, error: "no_file_uploaded" });
  }

  const publicUrl = `/uploads/${file.filename}`;
  return res.json({ ok: true, url: publicUrl });
});

export default router;