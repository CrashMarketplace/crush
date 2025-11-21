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

// Multer 설정 (accept any field, but validate file types)
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

// POST /images - accept any field name(s) but require at least one file
router.post("/images", (req, res) => {
  upload.any()(req as any, res as any, (err: any) => {
    // Log error for debugging
    if (err) {
      console.error("Upload error:", err);
    }

    // If multer returned an error, reply clearly
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ ok: false, error: err.message });
      }
      return res.status(400).json({ ok: false, error: err.message || "upload_failed" });
    }

    // Authentication
    const user = readUserFromReq(req);
    if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: "no_file_uploaded" });
    }

    // Validate each file (Multer's fileFilter already did this, but double-check)
    const uploadedUrls: string[] = [];
    const failedNames: string[] = [];

    for (const file of files) {
      if (!file.mimetype || !/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) {
        // remove file if exists
        try {
          fs.unlinkSync(path.join(uploadsDir, file.filename));
        } catch (_e) {}
        failedNames.push(file.originalname);
        continue;
      }
      uploadedUrls.push(`/uploads/${file.filename}`);
    }

    if (uploadedUrls.length === 0) {
      return res.status(400).json({ ok: false, error: "invalid_file_types", failed: failedNames });
    }

    // If only one file was uploaded, return url. Else return urls.
    if (uploadedUrls.length === 1) {
      return res.json({ ok: true, url: uploadedUrls[0] });
    }
    return res.json({ ok: true, urls: uploadedUrls });
  });
});

export default router;