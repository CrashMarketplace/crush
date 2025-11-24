import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { readUserFromReq } from "../utils/authToken";
import { uploadBufferToStorage, isCloudStorageEnabled } from "../lib/storage";

const router = Router();

// 업로드 디렉토리 설정 (환경변수 우선)
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage when cloud enabled, else disk
const storage = isCloudStorageEnabled()
  ? multer.memoryStorage()
  : multer.diskStorage({
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
    // Allow bmp to match client-side acceptance (ProductNew.tsx)
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only images (jpg,png,gif,webp,bmp) are allowed."));
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
  upload.fields(uploadFields)(req as any, res as any, async (err: any) => {
    // Log headers & fields for debugging
    console.log("=== Upload Request Start ===");
    console.log("Storage mode:", isCloudStorageEnabled() ? "R2 Cloud" : "Local Disk");
    console.log("Upload attempt:", req.method, req.path);
    console.log("Headers:", {
      origin: req.get("origin"),
      "content-type": req.get("content-type"),
      cookie: req.get("cookie") ? "present" : "missing",
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
      console.error("❌ No files received. Fields:", Object.keys(filesByField || {}));
      return res.status(400).json({ ok: false, error: "no_file_uploaded" });
    }

    console.log(`📦 Processing ${files.length} file(s)`);
    const uploadedUrls: string[] = [];
    const failedNames: string[] = [];
    for (const file of files) {
      console.log(`  File: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
      const typeOk = /^image\/(jpeg|png|gif|webp|bmp)$/.test(file.mimetype || "");
      if (!typeOk) {
        console.warn(`  ❌ Invalid type: ${file.mimetype}`);
        failedNames.push(file.originalname);
        continue;
      }

      try {
        if (isCloudStorageEnabled()) {
          // memory storage -> file.buffer available
          console.log(`  ☁️  Uploading to R2...`);
          const { url } = await uploadBufferToStorage(file.buffer, file.mimetype, file.originalname);
          console.log(`  ✅ R2 success: ${url}`);
          uploadedUrls.push(url);
        } else {
          // disk storage already saved -> build local URL
          if (!file.filename) {
            throw new Error("Disk storage failed: no filename");
          }
          const localUrl = `/uploads/${file.filename}`;
          console.log(`  💾 Local disk: ${localUrl}`);
          uploadedUrls.push(localUrl);
        }
      } catch (e: any) {
        console.error(`  ❌ Upload failed: ${e.message}`);
        failedNames.push(file.originalname);
      }
    }

    if (uploadedUrls.length === 0) {
      console.error("❌ All uploads failed. Failed files:", failedNames);
      return res.status(400).json({ ok: false, error: "invalid_or_failed", failed: failedNames });
    }
    
    console.log(`✅ Upload complete: ${uploadedUrls.length} succeeded, ${failedNames.length} failed`);
    console.log("=== Upload Request End ===");
    
    if (uploadedUrls.length === 1) {
      return res.json({ ok: true, url: uploadedUrls[0], urls: uploadedUrls });
    }
    return res.json({ ok: true, urls: uploadedUrls, failed: failedNames.length ? failedNames : undefined });
  });
});

export default router;