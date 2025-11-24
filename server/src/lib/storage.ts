import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

// Cloudflare R2 (S3 compatible) configuration via env
// Required envs for R2 usage:
// R2_ACCESS_KEY_ID
// R2_SECRET_ACCESS_KEY
// R2_ACCOUNT_ID (used to build endpoint https://{account}.r2.cloudflarestorage.com)
// R2_BUCKET
// Optional:
// R2_PUBLIC_BASE (custom domain or public base URL e.g. https://cdn.example.com)
// R2_PREFIX (optional key prefix inside bucket)

interface UploadResult { key: string; url: string; }

const hasR2Config = Boolean(
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_BUCKET
);

let s3: S3Client | null = null;
if (hasR2Config) {
  s3 = new S3Client({
    region: "auto", // Cloudflare R2 fixed value
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  });
}

function buildKey(originalName: string) {
  const ext = path.extname(originalName) || "";
  const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileName = base + ext.toLowerCase();
  const prefix = (process.env.R2_PREFIX || "").replace(/\/+$/, "");
  return prefix ? `${prefix}/${fileName}` : fileName;
}

function publicUrlForKey(key: string): string {
  const base = process.env.R2_PUBLIC_BASE?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  // fallback direct R2 endpoint (needs public bucket/domain binding)
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`;
}

export async function uploadBufferToStorage(buffer: Buffer, contentType: string, originalName: string): Promise<UploadResult> {
  if (hasR2Config && s3) {
    const key = buildKey(originalName);
    const put = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET as string,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read" as any, // R2 ignores ACL but kept for compatibility
    });
    await s3.send(put);
    return { key, url: publicUrlForKey(key) };
  }

  // Local fallback (stores to /uploads directory similar to previous behavior)
  const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const key = buildKey(originalName);
  const abs = path.join(uploadsDir, key);
  fs.writeFileSync(abs, buffer);
  return { key, url: `/uploads/${key}` };
}

export async function deleteObject(key: string): Promise<boolean> {
  if (hasR2Config && s3) {
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET as string,
        Key: key,
      }));
      return true;
    } catch (e) {
      console.warn("R2 delete failed", e);
      return false;
    }
  }
  // local fallback
  const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, "../../uploads");
  const abs = path.join(uploadsDir, key);
  if (fs.existsSync(abs)) {
    try { fs.unlinkSync(abs); return true; } catch { return false; }
  }
  return false;
}

export function isCloudStorageEnabled() {
  return hasR2Config;
}
