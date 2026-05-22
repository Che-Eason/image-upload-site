export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  return validTypes.includes(file.type);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// 使用相对路径，前后端统一部署在 Vercel
export const API_BASE = "";

export interface UploadFileResult {
  originalName: string;
  fileName: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface UploadResult {
  success: boolean;
  message: string;
  file?: UploadFileResult;
  files?: UploadFileResult[];
}
