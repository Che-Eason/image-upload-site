import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Dropbox - 极简图片上传",
  description: "现代化极简图片上传工具，支持拖拽上传、自动压缩、深色模式",
  keywords: ["图片上传", "图床", "图片压缩", "免费图床"],
  authors: [{ name: "Dropbox" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dropbox",
  },
  openGraph: {
    title: "Dropbox - 极简图片上传",
    description: "现代化极简图片上传工具",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
