"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export function GoodDeedForm({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function submit() {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, content, type: "GOOD_DEED" }),
      });
      if (res.ok) {
        setSent(true);
        toast("好意已送出", "success");
        setTimeout(() => { setSent(false); setOpen(false); setContent(""); }, 2000);
      } else {
        toast("发送失败", "error");
      }
    } catch {
      toast("网络错误", "error");
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && content.trim() && !sending) submit();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2.5 rounded-2xl bg-mint-50 text-sm text-mint-600 hover:bg-mint-100 transition-all border border-mint-200">
        🎁 我有多余的好意
      </button>
    );
  }

  if (sent) {
    return (
      <div className="bg-mint-50 rounded-3xl px-5 py-4 text-center animate-pop-spring space-y-2">
        <span className="text-lg">🎁</span>
        <p className="text-sm text-warm-600">已发出，先到先得</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-float-up">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="多了一把伞、做了太多饼干、有一本不再看的书..."
        className="w-full rounded-2xl border border-mint-200 bg-mint-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-mint-300"
        maxLength={100}
        autoFocus
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-warm-300">{content.length}/100</span>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-full text-xs text-warm-400">算了</button>
          <button onClick={submit} disabled={!content.trim() || sending} className="px-4 py-1.5 rounded-full bg-mint-400 text-white text-sm font-medium hover:bg-mint-500 disabled:opacity-40 transition-colors">
            {sending ? "..." : "送出"}
          </button>
        </div>
      </div>
    </div>
  );
}
