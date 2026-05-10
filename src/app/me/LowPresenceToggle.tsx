"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

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
    <Card className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-700">🛡 低存在模式</p>
        <p className="text-xs text-gray-400">最近不太想互动，想安静一段时间</p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-indigo-500" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "left-5" : "left-0.5"}`} />
      </button>
    </Card>
  );
}
