import express, { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const UPLOAD_DIR = path.resolve(__dirname, process.env.UPLOAD_DIR || "../../uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "20971520", 10); // 20MB

// ============================================================
// 存储结构
// uploads/
//   images/                    ← 所有图片统一存放
//     upload-log.json          ← 上传记录（自动生成）
//     2026-05-22_14-30-15_原文件名_UUID.jpg   ← 图片文件
//     thumbnails/              ← 缩略图
//       2026-05-22_14-30-15_原文件名_UUID.jpg
// ============================================================

const IMAGE_DIR = path.join(UPLOAD_DIR, "images");
const THUMB_DIR = path.join(IMAGE_DIR, "thumbnails");
const LOG_FILE = path.join(IMAGE_DIR, "upload-log.json");

// 确保目录存在
[IMAGE_DIR, THUMB_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================
// 上传记录
// ============================================================

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
  relativePath: string;
  thumbnailPath: string;
}

function readLog(): UploadRecord[] {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function writeLog(records: UploadRecord[]): void {
  fs.writeFileSync(LOG_FILE, JSON.stringify(records, null, 2), "utf-8");
}

function addToLog(record: UploadRecord): void {
  const records = readLog();
  records.unshift(record); // 最新在前
  writeLog(records);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// 生成可读文件名：时间戳_原文件名_UUID.ext
function makeFileName(originalName: string, ext: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    "-",
    pad(now.getMinutes()),
    "-",
    pad(now.getSeconds()),
  ].join("");

  // 去掉原文件名中的特殊字符，保留中文和英文
  const safeName = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9一-鿿_-]/g, "_")
    .substring(0, 50);

  const shortId = uuidv4().substring(0, 8);
  return `${timestamp}_${safeName}_${shortId}${ext}`;
}

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: [CORS_ORIGIN, "http://localhost:3000", "https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// 静态文件：通过 /images 访问上传的图片
app.use("/images", express.static(IMAGE_DIR));

// ============================================================
// 文件类型白名单
// ============================================================

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
}

// Multer: 存内存，用 Sharp 处理后写盘
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 20,
  },
});

// ============================================================
// 路由
// ============================================================

// 健康检查
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 查看上传记录（只读，浏览器可直接打开）
app.get("/images/upload-log.json", (_req: Request, res: Response) => {
  const records = readLog();
  // 网页友好的展示
  if (_req.headers.accept?.includes("text/html")) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>上传记录 - Dropbox</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f5f5f7; }
  h1 { font-size: 24px; margin-bottom: 20px; }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; gap: 16px; align-items: center; }
  .thumb { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: #eee; }
  .info { flex: 1; min-width: 0; }
  .info h3 { margin: 0 0 4px; font-size: 15px; word-break: break-all; }
  .info p { margin: 2px 0; font-size: 13px; color: #666; }
  .info a { color: #0071e3; font-size: 12px; word-break: break-all; }
  .badge { display: inline-block; background: #0071e310; color: #0071e3; padding: 2px 8px; border-radius: 6px; font-size: 11px; }
  .empty { text-align: center; color: #999; padding: 60px; }
  .count { color: #0071e3; font-size: 14px; margin-bottom: 20px; }
</style>
</head>
<body>
<h1>📁 上传记录</h1>
<p class="count">共 ${records.length} 张图片，保存在 <code>uploads/images/</code></p>
${records.length === 0 ? '<div class="empty">还没有上传过图片</div>' : ""}
${records.map(r => `
<div class="card">
  <img class="thumb" src="/images/thumbnails/${r.savedFileName}" alt="${r.originalName}" loading="lazy">
  <div class="info">
    <h3>${r.originalName}</h3>
    <p>📦 大小: ${r.sizeFormatted} · ${r.mimeType}</p>
    <p>🕐 上传时间: ${r.uploadedAt}</p>
    <p>📄 保存为: <code>${r.savedFileName}</code></p>
    <a href="/images/${r.savedFileName}" target="_blank">🔗 查看原图</a>
    <span class="badge">ID: ${r.id}</span>
  </div>
</div>
`).join("")}
</body>
</html>`;
    return res.send(html);
  }
  res.json(records);
});

// 上传接口
app.post(
  "/upload",
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("images", 20)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ success: false, message: "文件大小超过 20MB 限制" });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(413).json({ success: false, message: "每次最多上传 20 个文件" });
          }
          return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "请选择至少一个文件" });
    }

    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const results: UploadRecord[] = [];

      for (const file of files) {
        const ext = ALLOWED_TYPES[file.mimetype] || ".jpg";
        const fileName = makeFileName(file.originalname, ext);
        const imagePath = path.join(IMAGE_DIR, fileName);
        const thumbPath = path.join(THUMB_DIR, fileName);

        const image = sharp(file.buffer);
        const metadata = await image.metadata();

        let pipeline = image;
        if (metadata.width && metadata.width > 4000) {
          pipeline = pipeline.resize({ width: 4000, withoutEnlargement: true });
        }

        // 保存原图（压缩优化）
        await pipeline.jpeg({ quality: 85, progressive: true }).toFile(imagePath);

        // 生成缩略图
        await sharp(file.buffer)
          .resize({ width: 400, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);

        const record: UploadRecord = {
          id: uuidv4().substring(0, 8),
          originalName: file.originalname,
          savedFileName: fileName,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          mimeType: file.mimetype,
          uploadedAt: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
          url: `${baseUrl}/images/${fileName}`,
          thumbnailUrl: `${baseUrl}/images/thumbnails/${fileName}`,
          relativePath: `uploads/images/${fileName}`,
          thumbnailPath: `uploads/images/thumbnails/${fileName}`,
        };

        addToLog(record);
        results.push(record);
      }

      return res.json({
        success: true,
        message: `成功上传 ${results.length} 个文件`,
        file: results[0],
        files: results,
        logUrl: `${baseUrl}/images/upload-log.json`,
      });
    } catch (err) {
      console.error("Image processing error:", err);
      return res.status(500).json({ success: false, message: "图片处理失败" });
    }
  }
);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "接口不存在" });
});

// 错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "服务器内部错误" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server:    http://localhost:${PORT}`);
  console.log(`📁 图片目录:  ${IMAGE_DIR}`);
  console.log(`📋 上传记录:  ${LOG_FILE}`);
  console.log(`🌐 CORS:      ${CORS_ORIGIN}`);
});

export default app;
