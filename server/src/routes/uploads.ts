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

// Multer 설정 (accept fixed set of field names to avoid Unexpected field)
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

// Accept these common field names; prevents Unexpected field error if client uses any of them
const uploadFields = [
  { name: "image", maxCount: 5 },
  { name: "images", maxCount: 5 },
  { name: "file", maxCount: 5 },
  { name: "files", maxCount: 5 },
  { name: "image[]", maxCount: 5 },
  { name: "images[]", maxCount: 5 },
];

// POST /images - accept common field name(s)
router.post("/images", (req, res) => {
  upload.fields(uploadFields)(req as any, res as any, (err: any) => {
    // Log headers & fields for debugging
    console.log("Upload attempt:", req.method, req.path);
    console.log("Headers:", {
      origin: req.get("origin"),
      "content-type": req.get("content-type"),
    });

    if (err) {
      console.error("Upload error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ ok: false, error: err.message });
      }
      if (err && typeof err.message === "string" && /Unexpected field/i.test(err.message)) {
        // Common guidance message
        return res.status(400).json({
          ok: false,
          error: "unexpected_field",
          message:
            "Use field name 'image' or 'images' (or 'file', 'files') in the multipart/form-data request.",
        });
      }
      return res.status(400).json({ ok: false, error: err.message || "upload_failed" });
    }

    // Authentication
    const user = readUserFromReq(req);
    if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

    // Collect files from all allowed fields
    const filesByField = (req as any).files as { [key: string]: Express.Multer.File[] } | undefined;
    let files: Express.Multer.File[] = [];
    if (filesByField && Object.keys(filesByField).length > 0) {
      for (const key of Object.keys(filesByField)) {
        files = files.concat(filesByField[key]);
      }
    }

    // Fallback: if multer didn't populate req.files (shouldn't happen), check req.file
    if ((!files || files.length === 0) && (req as any).file) {
      files = [(req as any).file];
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: "no_file_uploaded" });
    }

    // Validate and respond
    const uploadedUrls: string[] = [];
    const failedNames: string[] = [];
    for (const file of files) {
      if (!file.mimetype || !/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) {
        // remove invalid file if saved
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

    if (uploadedUrls.length === 1) {
      return res.json({ ok: true, url: uploadedUrls[0] });
    }
    return res.json({ ok: true, urls: uploadedUrls });
  });
});

export default router;