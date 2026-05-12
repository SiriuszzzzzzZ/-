"use client";
import { useState } from "react";

export function LowPresenceToggle({ current }: { current: boolean }) {
  const [enabled, setEnabled] = useState(current);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !enabled;
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lowPresenceMode: next }),
    });
    setEnabled(next);
    setLoading(false);
  }

  return (
    <div className="bg-white/60 rounded-2xl p-4 shadow-soft flex justify-between items-center">
      <div>
        <p className="text-sm text-warm-700">🛡 低存在模式</p>
        <p className="text-xs text-warm-400 mt-0.5">最近不太想互动，想安静一段时间</p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          enabled ? "bg-coral-400" : "bg-warm-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
