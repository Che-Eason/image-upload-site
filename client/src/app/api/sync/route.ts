import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";

// 本地存储路径
const LOCAL_UPLOADS = path.resolve(process.cwd(), "../../uploads/images");
const isLocal = !process.env.VERCEL;

export async function POST() {
  if (!isLocal) {
    return NextResponse.json({
      success: false,
      message: "同步功能仅限本地运行，Vercel 环境不支持",
    });
  }

  try {
    // 列出 Vercel Blob 上所有图片
    const { blobs } = await list({ prefix: "uploads/images/" });
    const imageBlobs = blobs.filter(
      (b) =>
        !b.pathname.includes("history/") &&
        !b.pathname.includes("thumbnails/") &&
        (b.pathname.endsWith(".jpg") ||
          b.pathname.endsWith(".png") ||
          b.pathname.endsWith(".webp"))
    );

    const thumbBlobs = blobs.filter(
      (b) =>
        b.pathname.includes("thumbnails/") &&
        (b.pathname.endsWith(".jpg") ||
          b.pathname.endsWith(".png") ||
          b.pathname.endsWith(".webp"))
    );

    if (imageBlobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "云端没有图片需要同步",
        synced: 0,
      });
    }

    const imgDir = LOCAL_UPLOADS;
    const thumbDir = path.join(LOCAL_UPLOADS, "thumbnails");
    [imgDir, thumbDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    let synced = 0;

    // 下载原图
    for (const blob of imageBlobs) {
      const fileName = path.basename(blob.pathname);
      const localPath = path.join(imgDir, fileName);
      if (!fs.existsSync(localPath)) {
        const response = await fetch(blob.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        synced++;
      }
    }

    // 下载缩略图
    for (const blob of thumbBlobs) {
      const fileName = path.basename(blob.pathname);
      const localPath = path.join(thumbDir, fileName);
      if (!fs.existsSync(localPath)) {
        const response = await fetch(blob.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
      }
    }

    // 同步历史记录
    const historyBlob = blobs.find(
      (b) => b.pathname === "uploads/history/upload-history.json"
    );
    if (historyBlob) {
      const resp = await fetch(historyBlob.url);
      const historyDir = path.join(LOCAL_UPLOADS, "..");
      fs.writeFileSync(
        path.join(historyDir, "同步记录.json"),
        JSON.stringify(await resp.json(), null, 2),
        "utf-8"
      );
    }

    return NextResponse.json({
      success: true,
      message: `同步完成：${synced} 张新图片已下载到本地`,
      synced,
      localPath: imgDir,
      total: imageBlobs.length,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { success: false, message: "同步失败" },
      { status: 500 }
    );
  }
}
