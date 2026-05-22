"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, Download, Copy, ExternalLink, ArrowLeft, Image } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { formatFileSize } from "@/lib/utils";

interface HistoryItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  size: number;
  savedFileName: string;
  sizeFormatted: string;
  uploadedAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setImages(data);
    } catch (e) {
      console.error("Gallery load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass flex h-10 w-10 items-center justify-center rounded-2xl"
              >
                <ArrowLeft size={18} />
              </motion.div>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-apple-blue">
                <Image size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-none">
                  相册
                </h1>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {images.length > 0
                    ? `${images.length} 张图片 · 所有设备共享`
                    : "还没有上传过图片"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="glass flex h-10 w-10 items-center justify-center rounded-2xl"
              title={viewMode === "grid" ? "切换到列表视图" : "切换到网格视图"}
            >
              {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
            </motion.button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-apple-blue border-t-transparent"
            />
          </div>
        ) : images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-40 text-center"
          >
            <div className="glass mx-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-black/5 dark:bg-white/5">
                <Image size={36} className="text-black/20 dark:text-white/20" />
              </div>
              <p className="text-lg font-medium">相册为空</p>
              <p className="text-sm text-black/40 dark:text-white/40">
                上传图片后，手机和电脑都能在这里看到
              </p>
              <Link href="/">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block cursor-pointer rounded-2xl bg-apple-blue px-6 py-2.5 text-sm font-medium text-white"
                >
                  去上传
                </motion.span>
              </Link>
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelected(img)}
                  className="glass group cursor-pointer overflow-hidden rounded-2xl"
                >
                  <div className="aspect-square overflow-hidden">
                    <motion.img
                      src={img.thumbnailUrl || img.url}
                      alt={img.originalName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium">
                      {img.originalName}
                    </p>
                    <p className="text-[10px] text-black/40 dark:text-white/40">
                      {img.sizeFormatted || formatFileSize(img.size)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass flex items-center gap-4 rounded-2xl p-4"
                >
                  <img
                    src={img.thumbnailUrl || img.url}
                    alt={img.originalName}
                    className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {img.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
                      <span>{img.sizeFormatted || formatFileSize(img.size)}</span>
                      <span>·</span>
                      <span>{img.uploadedAt || "刚刚"}</span>
                      <span>·</span>
                      <span className="truncate text-[10px]">{img.savedFileName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyUrl(img.url, img.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10 dark:bg-white/10"
                      title="复制链接"
                    >
                      {copied === img.id ? (
                        <span className="text-xs text-green-500">✓</span>
                      ) : (
                        <Copy size={14} />
                      )}
                    </motion.button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10 dark:bg-white/10"
                      title="查看原图"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Refresh button */}
        {images.length > 0 && (
          <div className="mt-8 text-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={loadImages}
              className="rounded-2xl bg-black/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
            >
              刷新相册
            </motion.button>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl"
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                ✕
              </button>

              {/* Image */}
              <img
                src={selected.url}
                alt={selected.originalName}
                className="max-h-[75vh] w-full object-contain"
              />

              {/* Info bar */}
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {selected.originalName}
                  </p>
                  <p className="text-xs text-black/40 dark:text-white/40">
                    {selected.sizeFormatted || formatFileSize(selected.size)}
                    {" · "}
                    {selected.uploadedAt || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyUrl(selected.url, selected.id)}
                    className="flex items-center gap-1.5 rounded-2xl bg-apple-blue px-4 py-2 text-sm font-medium text-white"
                  >
                    {copied === selected.id ? "✓ 已复制" : "复制链接"}
                  </motion.button>
                  <a
                    href={selected.url}
                    download
                    className="flex items-center gap-1.5 rounded-2xl bg-black/5 px-4 py-2 text-sm font-medium hover:bg-black/10 dark:bg-white/10"
                  >
                    <Download size={16} />
                    下载
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
