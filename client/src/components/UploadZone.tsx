"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2 } from "lucide-react";
import ProgressBar from "./ProgressBar";
import UploadHistory, { HistoryItem } from "./UploadHistory";
import { formatFileSize, UploadResult, UploadFileResult } from "@/lib/utils";

async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const res = await fetch("/api/history");
    const data = await res.json();
    return data.map((r: Record<string, unknown>) => ({
      id: r.savedFileName as string,
      url: r.url as string,
      thumbnailUrl: r.thumbnailUrl as string,
      originalName: r.originalName as string,
      size: r.size as number,
      uploadedAt: new Date(r.uploadedAt as string),
    }));
  } catch {
    return [];
  }
}

export default function UploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    fetchHistory().then(setHistory);
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    setComplete(false);
    setFiles((prev) => {
      const merged = [...prev, ...accepted].slice(0, 20);
      const newPreviews = merged.map((f) => URL.createObjectURL(f));
      // revoke old previews
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews(newPreviews);
      return merged;
    });
  }, [previews]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
    noClick: files.length > 0,
    noKeyboard: false,
  });

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setComplete(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setComplete(false);

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      const result: UploadResult = await new Promise((resolve, reject) => {
        xhr.open("POST", `/api/upload`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error("网络错误"));
        xhr.send(formData);
      });

      if (result.success && result.files) {
        // Reload shared history from server (cross-device sync)
        const updated = await fetchHistory();
        setHistory(updated);
      }

      setComplete(true);
      // clear previews after success
      setTimeout(() => {
        previews.forEach((p) => URL.revokeObjectURL(p));
        setFiles([]);
        setPreviews([]);
        setComplete(false);
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6">
      <AnimatePresence mode="wait">
        {!complete ? (
          <motion.section
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`glass relative cursor-pointer overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-lg sm:p-12 ${
                isDragActive ? "drag-active scale-[1.02]" : ""
              }`}
            >
              <input {...getInputProps()} />

              <motion.div
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <motion.div
                  animate={isDragActive ? { y: -8 } : { y: 0 }}
                  className="flex h-16 w-16 items-center justify-center rounded-3xl bg-apple-blue/10 dark:bg-apple-blue/20"
                >
                  <Upload
                    size={28}
                    className="text-apple-blue"
                    strokeWidth={1.5}
                  />
                </motion.div>

                {isDragActive ? (
                  <p className="text-lg font-medium text-apple-blue">
                    松开手指即可上传
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      拖拽图片到此处
                      <span className="text-black/30 dark:text-white/30">
                        {" "}
                        或{" "}
                      </span>
                      <button
                        type="button"
                        onClick={open}
                        className="text-apple-blue hover:underline"
                      >
                        选择文件
                      </button>
                    </p>
                    <p className="text-sm text-black/40 dark:text-white/40">
                      支持 JPG、PNG、WebP、HEIC · 单文件最大 20MB
                    </p>
                  </>
                )}
              </motion.div>
            </div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      已选择 {files.length} 个文件
                    </span>
                    <button
                      onClick={() => {
                        previews.forEach((p) => URL.revokeObjectURL(p));
                        setFiles([]);
                        setPreviews([]);
                      }}
                      className="text-sm text-black/40 hover:text-red-500 dark:text-white/40"
                    >
                      全部清除
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {previews.map((preview, i) => (
                      <motion.div
                        key={preview}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="glass group relative aspect-square overflow-hidden rounded-2xl"
                      >
                        <img
                          src={preview}
                          alt={files[i]?.name ?? ""}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-xs text-white">
                            {files[i]?.name}
                          </p>
                          <p className="text-[10px] text-white/60">
                            {formatFileSize(files[i]?.size ?? 0)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Upload button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full rounded-2xl bg-apple-blue py-3.5 text-base font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploading ? "上传中..." : `上传 ${files.length} 个文件`}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            {uploading && <ProgressBar progress={progress} />}
          </motion.section>
        ) : (
          /* Success state */
          <motion.section
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass flex flex-col items-center gap-4 rounded-3xl p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
            >
              <CheckCircle2 size={40} className="text-green-500" />
            </motion.div>
            <h3 className="text-xl font-semibold">上传成功</h3>
            <p className="text-sm text-black/40 dark:text-white/40">
              图片已上传并自动压缩，链接已复制到剪贴板
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Upload history */}
      <UploadHistory items={history} />
    </div>
  );
}
