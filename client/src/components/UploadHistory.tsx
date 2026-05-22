"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Clock } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { useState } from "react";

export interface HistoryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
  return `${Math.floor(seconds / 86400)} 天前`;
}

export default function UploadHistory({ items }: { items: HistoryItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  };

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12"
    >
      <h3 className="mb-4 text-lg font-semibold">上传历史</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              {/* Thumbnail */}
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.originalName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.originalName}
                </p>
                <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
                  <span>{formatFileSize(item.size)}</span>
                  <span>·</span>
                  <Clock size={10} />
                  <span>{timeAgo(item.uploadedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyUrl(item.url, item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                  title="复制链接"
                >
                  {copiedId === item.id ? (
                    <span className="text-xs text-green-500">✓</span>
                  ) : (
                    <Copy size={14} />
                  )}
                </motion.button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                  title="在新标签页打开"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
