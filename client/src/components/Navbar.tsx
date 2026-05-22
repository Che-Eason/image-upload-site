"use client";

import { motion } from "framer-motion";
import { Upload, Image } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <Link href="/">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-apple-blue">
              <Upload size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Dropbox</span>
          </motion.div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/gallery">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                pathname === "/gallery"
                  ? "bg-apple-blue text-white"
                  : "glass hover:shadow-md"
              }`}
            >
              <Image size={16} />
              相册
            </motion.div>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
