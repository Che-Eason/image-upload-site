import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join("/tmp", "uploads");
const THUMB_DIR = path.join(UPLOAD_DIR, "thumbnails");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Check if requesting thumbnail or original
  let filePath: string;
  if (segments[0] === "thumbnails" && segments.length === 2) {
    filePath = path.join(THUMB_DIR, path.basename(segments[1]));
  } else if (segments.length === 1) {
    filePath = path.join(UPLOAD_DIR, path.basename(segments[0]));
  } else {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".heic": "image/heic",
      ".heif": "image/heif",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
