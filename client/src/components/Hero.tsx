"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 pt-20 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl dark:from-blue-500/5 dark:to-purple-500/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-4 py-1.5 text-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-black/60 dark:text-white/60">全新上线 · 完全免费</span>
        </motion.div>

        <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          上传图片，
          <br />
          <span className="bg-gradient-to-r from-apple-blue to-blue-500 bg-clip-text text-transparent">
            从未如此简单
          </span>
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-black/50 dark:text-white/50 sm:text-xl">
          拖拽、选择、上传。自动压缩，生成链接。
          <br className="hidden sm:block" />
          专为 iPhone、iPad、Mac 优化的极简体验。
        </p>
      </motion.div>
    </section>
  );
}
