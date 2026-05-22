import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 20;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function makeFileName(originalName: string, ext: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const safeName = originalName
    .replace(/\.[^.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9一-鿿_-]/g, "_")
    .substring(0, 50);
  const shortId = uuidv4().substring(0, 8);
  return `${timestamp}_${safeName}_${shortId}${ext}`;
}

interface UploadRecord {
  id: string;
  originalName: string;
  savedFileName: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedAt: string;
  url: string;
  thumbnailUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files: File[] = [];

    for (const [, value] of formData.entries()) {
      if (value instanceof File && ALLOWED_TYPES[value.type]) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "请选择至少一个图片文件" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, message: `每次最多上传 ${MAX_FILES} 个文件` },
        { status: 400 }
      );
    }

    const results: UploadRecord[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = ALLOWED_TYPES[file.type] || ".jpg";
      const fileName = makeFileName(file.name, ext);
      const buffer = Buffer.from(await file.arrayBuffer());

      // Process image with Sharp
      const metadata = await sharp(buffer).metadata();
      let pipeline = sharp(buffer);
      if (metadata.width && metadata.width > 4000) {
        pipeline = pipeline.resize({ width: 4000, withoutEnlargement: true });
      }
      const optimizedBuffer = await pipeline
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Generate thumbnail
      const thumbBuffer = await sharp(buffer)
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to Vercel Blob (persistent, public URLs)
      const [originalBlob, thumbBlob] = await Promise.all([
        put(`images/${fileName}`, optimizedBuffer, {
          access: "public",
          contentType: "image/jpeg",
        }),
        put(`images/thumbnails/${fileName}`, thumbBuffer, {
          access: "public",
          contentType: "image/jpeg",
        }),
      ]);

      const record: UploadRecord = {
        id: uuidv4().substring(0, 8),
        originalName: file.name,
        savedFileName: fileName,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        mimeType: file.type,
        uploadedAt: new Date().toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
        }),
        url: originalBlob.url,
        thumbnailUrl: thumbBlob.url,
      };

      results.push(record);
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: "所有文件均不符合要求" },
        { status: 400 }
      );
    }

    // Save to shared history on Blob (cross-device access)
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "history/" });
      const historyBlob = blobs.find((b) => b.pathname === "history/upload-history.json");
      let existing: UploadRecord[] = [];
      if (historyBlob) {
        const resp = await fetch(historyBlob.url);
        existing = await resp.json();
      }
      // Delete old history blob
      for (const b of blobs) {
        const { del } = await import("@vercel/blob");
        await del(b.url);
      }
      // Merge and save
      const merged = [...results, ...existing].slice(0, 100);
      await put("history/upload-history.json", JSON.stringify(merged), {
        access: "public",
        contentType: "application/json",
      });
    } catch (e) {
      console.error("History sync error:", e);
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${results.length} 个文件`,
      file: results[0],
      files: results,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "图片处理失败" },
      { status: 500 }
    );
  }
}
