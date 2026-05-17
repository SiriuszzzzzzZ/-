"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

const QUICK_REASONS = ["被你暖到了", "你说得真好", "注意到你在努力", "谢谢你", "加油"];

export function LightUpButton({ toUserId, toUserName }: { toUserId: string; toUserName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function lightUp(text: string) {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, reason: text }),
      });
      if (res.ok) {
        setDone(true);
        toast(`已点亮 ${toUserName}`, "success");
        setTimeout(() => { setDone(false); setOpen(false); setReason(""); }, 2500);
      } else {
        const data = await res.json();
        setError(data.error || "点亮失败");
      }
    } catch {
      setError("网络错误");
    }
    setSending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-warm-300 hover:text-amber-400 transition-colors flex items-center gap-1"
        title={`点亮 ${toUserName}`}
      >
        ☆ 点亮
      </button>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-1 animate-pop-spring">
        <span className="text-amber-400 text-sm">⭐</span>
        <span className="text-[10px] text-mint-500">已点亮 {toUserName}</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 rounded-xl p-2 space-y-1.5 shadow-soft">
      <p className="text-[10px] text-warm-400">
        为什么想点亮 <span className="text-warm-600 font-medium">{toUserName}</span>？
      </p>
      <div className="flex flex-wrap gap-1">
        {QUICK_REASONS.map((r) => (
          <button
            key={r}
            onClick={() => lightUp(r)}
            disabled={sending}
            className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40 transition-colors"
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="自定义..."
          className="flex-1 text-[10px] rounded-lg border border-warm-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-300"
          maxLength={30}
        />
        <button
          onClick={() => reason.trim() && lightUp(reason.trim())}
          disabled={!reason.trim() || sending}
          className="text-[10px] px-2 py-1 rounded-lg bg-amber-100 text-amber-600 font-medium hover:bg-amber-200 disabled:opacity-40"
        >
          {sending ? "..." : "发送"}
        </button>
        <button onClick={() => setOpen(false)} className="text-[10px] px-1 text-warm-300 touch-target" aria-label="取消点亮">×</button>
      </div>
      {error && <p className="text-[10px] text-coral-500">{error}</p>}
    </div>
  );
}
