"use client";
import { useState } from "react";

export function TreeholeQuick({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, content: text, treehole: true }),
    });
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setText(""); }, 1500);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-xs text-warm-300 hover:text-warm-500 py-3 border border-dashed border-warm-200 rounded-2xl transition-colors"
      >
        有什么不想被认出来的话？丢进树洞 →
      </button>
    );
  }

  if (sent) {
    return (
      <div className="bg-mint-50 rounded-2xl px-4 py-3 text-center animate-pop-spring">
        <p className="text-sm text-mint-600">已丢进树洞 🌲</p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 rounded-2xl p-3 space-y-2 animate-float-up">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="匿名，只有词云会被辅导员看到"
        className="w-full rounded-xl border border-warm-200 bg-white/50 px-3 py-2 text-xs text-warm-600 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-mint-300 resize-none h-14"
        maxLength={200}
        autoFocus
      />
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-warm-300">{text.length}/200</span>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="text-xs text-warm-400 px-2">算了</button>
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="text-xs px-3 py-1 rounded-xl bg-mint-100 text-mint-600 font-medium hover:bg-mint-200 disabled:opacity-40 transition-colors"
          >
            丢进去
          </button>
        </div>
      </div>
    </div>
  );
}
