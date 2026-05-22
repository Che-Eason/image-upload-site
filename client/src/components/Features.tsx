"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Smartphone, Globe, Image, Wand2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "极速上传",
    desc: "拖拽即传，自动压缩，无需等待。上传一张图片仅需 0.5 秒。",
  },
  {
    icon: Image,
    title: "智能压缩",
    desc: "自动平衡画质与文件大小，最大压缩率达 80%，肉眼几乎无差别。",
  },
  {
    icon: Globe,
    title: "全球加速",
    desc: "图片上传后自动获得公网链接，全球 CDN 加速访问。",
  },
  {
    icon: Smartphone,
    title: "全平台适配",
    desc: "完美适配 iPhone、iPad、Android 及桌面端，随时随地使用。",
  },
  {
    icon: Shield,
    title: "安全可靠",
    desc: "文件类型严格校验，上传链路加密，定期清理过期文件。",
  },
  {
    icon: Wand2,
    title: "深色模式",
    desc: "自动跟随系统或手动切换，保护视力的同时保持优雅外观。",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          为什么选择 Dropbox
        </h2>
        <p className="text-black/40 dark:text-white/40">
          为创作者打造的极简图片托管工具
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feat) => (
          <motion.div
            key={feat.title}
            variants={item}
            className="glass group rounded-2xl p-6 transition-all duration-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/20">
              <feat.icon
                size={20}
                className="text-apple-blue"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="mb-2 text-base font-semibold">{feat.title}</h3>
            <p className="text-sm leading-relaxed text-black/40 dark:text-white/40">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
