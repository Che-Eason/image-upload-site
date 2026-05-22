import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

const HISTORY_BLOB_PATH = "history/upload-history.json";

interface HistoryRecord {
  id: string;
  originalName: string;
  savedFileName: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: string;
  url: string;
  thumbnailUrl: string;
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "history/" });
    const historyBlob = blobs.find((b) => b.pathname === HISTORY_BLOB_PATH);
    if (!historyBlob) {
      return NextResponse.json([]);
    }
    const response = await fetch(historyBlob.url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("History read error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { records } = await request.json();
    if (!Array.isArray(records)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Read existing history
    let existing: HistoryRecord[] = [];
    try {
      const { blobs } = await list({ prefix: "history/" });
      const historyBlob = blobs.find((b) => b.pathname === HISTORY_BLOB_PATH);
      if (historyBlob) {
        const resp = await fetch(historyBlob.url);
        existing = await resp.json();
      }
    } catch {}

    // Merge: new records first, keep last 100
    const merged = [...records, ...existing].slice(0, 100);

    // Delete old blob, write new one
    try {
      const { blobs } = await list({ prefix: "history/" });
      for (const b of blobs) {
        await del(b.url);
      }
    } catch {}

    await put(HISTORY_BLOB_PATH, JSON.stringify(merged), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, count: merged.length });
  } catch (err) {
    console.error("History write error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
