"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export function TreeholeResponder({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, content: `[辅导员的回应] ${text.trim()}`, type: "HELP_EMOTION", treehole: true }),
      });
      if (res.ok) {
        toast("回应已匿名发出", "success");
        setText("");
        setOpen(false);
      } else {
        toast("发送失败", "error");
      }
    } catch {
      toast("网络错误", "error");
    }
    setSending(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2.5 rounded-2xl bg-coral-50 text-sm text-coral-500 hover:bg-coral-100 transition-all border border-coral-200">
        🌲 匿名回应树洞
      </button>
    );
  }

  return (
    <div className="space-y-2 animate-float-up">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="以匿名身份回应树洞中的声音..."
        className="w-full rounded-2xl border border-coral-200 bg-coral-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-warm-300">{text.length}/200</span>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="px-3 py-1 text-xs text-warm-400">算了</button>
          <button onClick={submit} disabled={!text.trim() || sending} className="px-4 py-1.5 rounded-full bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40">
            {sending ? "..." : "匿名发出"}
          </button>
        </div>
      </div>
    </div>
  );
}
