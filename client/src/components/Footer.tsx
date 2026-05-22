"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-black/5 py-10 dark:border-white/5"
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-sm text-black/30 dark:text-white/30">
          Dropbox · 极简图片上传工具 · 为创作者而生
        </p>
        <p className="mt-2 text-xs text-black/20 dark:text-white/20">
          &copy; {new Date().getFullYear()} Dropbox. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
