"use client";
import { useState } from "react";

export function ShareQuick({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, content, type: "SHARE" }),
    });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      setContent("");
    }, 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-11 py-3 rounded-2xl bg-mint-50 text-sm text-mint-600 hover:bg-mint-100 hover:text-mint-700 transition-all duration-200 border border-mint-200 hover:border-mint-300 active:scale-[0.99]"
      >
        ✨ 说点什么吧
      </button>
    );
  }

  if (sent) {
    return (
      <div className="bg-mint-50 rounded-3xl px-5 py-4 text-center animate-pop-spring space-y-2">
        <p className="text-lg">✨</p>
        <p className="text-sm text-warm-600">已分享给班级</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="share-content" className="visually-hidden">分享一件班级日常</label>
      <textarea
        id="share-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享一件小事：听到一首好歌、看到一只猫、今天的心情..."
        className="w-full rounded-2xl border border-mint-200 bg-mint-50/30 px-4 py-3 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-mint-300 resize-none h-16"
        maxLength={200}
        autoFocus
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-warm-300">{content.length}/200</span>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="min-h-11 px-3 py-1 rounded-full text-xs text-warm-400 hover:text-warm-600"
          >
            算了
          </button>
          <button
            onClick={submit}
            disabled={!content.trim()}
            className="min-h-11 px-4 py-1.5 rounded-full bg-mint-400 text-white text-sm font-medium hover:bg-mint-500 disabled:opacity-40 transition-colors"
          >
            分享
          </button>
        </div>
      </div>
    </div>
  );
}
