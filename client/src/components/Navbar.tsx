"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-apple-blue">
            <Upload size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Dropbox</span>
        </motion.div>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
