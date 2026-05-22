import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join("/tmp", "uploads", "history.json");

export async function GET() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json([]);
    }
    const data = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
