// server/src/routes/upload.ts
import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// ---------- Multer: 메모리 저장 (파일을 디스크에 안 씀) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|gif|webp|bmp)$/i.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ---------- R2(S3) 클라이언트 ----------
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

// 랜덤 파일 이름 생성
function makeKey(originalName: string) {
  const ext = (originalName.split(".").pop() || "png").toLowerCase();
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}

// ---------- 이미지 업로드 API ----------
router.post(
  "/images",
  upload.array("files", 5),
  async (req: Request, res: Response) => {
    try {
      const user = readUserFromReq(req);
      if (!user) {
        return res.status(401).json({ ok: false, error: "unauthorized" });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) {
        return res.status(400).json({ ok: false, error: "no_files_uploaded" });
      }

      const urls: string[] = [];

      for (const file of files) {
        const key = makeKey(file.originalname);

        // R2에 업로드
        await r2.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );

        // 퍼블릭 URL 조합
        if (!PUBLIC_BASE) {
          // PUBLIC_BASE 설정 안 했으면 S3-style URL로라도 리턴
          urls.push(`${process.env.R2_ENDPOINT}/${BUCKET}/${key}`);
        } else {
          urls.push(`${PUBLIC_BASE}/${key}`);
        }
      }

      return res.status(201).json({ ok: true, urls });
    } catch (err: any) {
      console.error("R2 upload error:", err);
      return res
        .status(500)
        .json({ ok: false, error: err.message || "upload_failed" });
    }
  }
);

export default router;
