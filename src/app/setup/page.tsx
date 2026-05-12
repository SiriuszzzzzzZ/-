"use client";
import { useState } from "react";

const COLORS = [
  { id: "coral", label: "暖橘", class: "bg-coral-400" },
  { id: "mint", label: "薄荷", class: "bg-mint-400" },
  { id: "peach", label: "蜜桃", class: "bg-peach-400" },
  { id: "purple", label: "薰衣草", class: "bg-purple-400" },
  { id: "amber", label: "阳光", class: "bg-amber-400" },
];

export default function SetupPage() {
  const [color, setColor] = useState("coral");
  const [signature, setSignature] = useState("");

  async function finish() {
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeColor: color, signature }),
    });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-coral-100/60 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-mint-100/60 blur-3xl" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-4xl bg-mint-100 mb-1">
            <span className="text-2xl">🎨</span>
          </div>
          <h1 className="text-xl font-bold text-warm-800">装扮你的空间</h1>
          <p className="text-sm text-warm-400">选一个颜色，写一句签名</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-4xl shadow-soft-lg p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-warm-600 mb-3">主题色</p>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-10 h-10 rounded-2xl ${c.class} transition-all duration-200 ${
                    color === c.id ? "ring-2 ring-offset-2 ring-coral-300 scale-110" : "hover:scale-105"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-warm-600 mb-2">签名</p>
            <input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="写一句话..."
              className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent"
              maxLength={50}
            />
          </div>
          <button
            onClick={finish}
            className="w-full bg-coral-400 hover:bg-coral-500 text-white font-medium py-2.5 px-4 rounded-2xl transition-all duration-200 hover:shadow-soft active:scale-[0.98]"
          >
            进入班级
          </button>
        </div>
      </div>
    </div>
  );
}
