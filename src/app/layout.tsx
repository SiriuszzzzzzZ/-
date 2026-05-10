import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "辅导员平台", description: "低压力关系基础设施" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
