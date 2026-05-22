"use client";

import { motion } from "framer-motion";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">正在上传...</span>
        <span className="text-sm tabular-nums text-apple-blue">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <motion.div
          className="progress-shimmer h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
