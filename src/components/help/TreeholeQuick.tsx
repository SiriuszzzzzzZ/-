"use client";
import { useState } from "react";

interface Feedback {
  similarCount: number;
  topWords: string[];
}
interface AiMatchResult {
  feedback: Feedback | null;
  aiMatch: string | null;
}

export function TreeholeQuick({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [aiMatch, setAiMatch] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, content: text, treehole: true }),
    });
    const data = await res.json();
    if (data.success) {
      const fbRes = await fetch("/api/treehole-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, content: text }),
      });
      const fbData: AiMatchResult = await fbRes.json();
      if (fbData.feedback) setFeedback(fbData.feedback);
      if (fbData.aiMatch) setAiMatch(fbData.aiMatch);
    }
    setSent(true);
  }

  function close() {
    setOpen(false);
    setSent(false);
    setText("");
    setFeedback(null);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-11 py-3 rounded-2xl bg-gradient-to-r from-mint-50 to-peach-50 text-sm text-warm-500 hover:text-warm-700 border border-dashed border-mint-200 hover:border-mint-300 transition-all duration-200 hover:shadow-soft"
      >
        🌲 有什么不想被认出来的话？丢进树洞 →
      </button>
    );
  }

  if (sent) {
    return (
      <div className="bg-mint-50 rounded-2xl px-4 py-3 text-center animate-pop-spring space-y-2">
        <p className="text-sm text-mint-600">已丢进树洞 🌲</p>
        <p className="text-xs text-warm-500">同学不会看到你的身份；辅导员侧主要看到汇总和需要关注的信号。</p>
        {feedback && (
          <div className="bg-white/60 rounded-xl px-3 py-2">
            <p className="text-xs text-warm-500">
              本周有 <span className="text-mint-600 font-medium">{feedback.similarCount}</span> 位同学表达了相似的感受
            </p>
            {feedback.topWords.length > 0 && (
              <p className="text-[10px] text-warm-400 mt-1">
                共同词：{feedback.topWords.join(" · ")}
              </p>
            )}
          </div>
        )}
        {aiMatch && (
          <div className="bg-white/60 rounded-xl px-3 py-2">
            <p className="text-xs text-warm-500 leading-relaxed">{aiMatch}</p>
            <span className="text-[9px] text-mint-400 mt-1 inline-block">🤖 AI 匹配</span>
          </div>
        )}
        <button onClick={close} className="text-xs text-warm-400 hover:text-warm-600 mt-1">
          好的
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/40 rounded-2xl p-3 space-y-2 animate-float-up">
      <label htmlFor="treehole-content" className="visually-hidden">写下匿名树洞内容</label>
      <p className="text-xs text-warm-400 px-1">匿名内容不会直接展示给同学；辅导员侧主要看到汇总和需关注信号。</p>
      <textarea
        id="treehole-content"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写下不想被认出来的话"
        className="w-full rounded-xl border border-warm-200 bg-white/50 px-3 py-2 text-xs text-warm-600 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-mint-300 resize-none h-14"
        maxLength={200}
        autoFocus
        rows={3}
      />
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-warm-300">{text.length}/200</span>
        <div className="flex gap-2">
          <button onClick={close} className="min-h-11 text-xs text-warm-400 px-3">算了</button>
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="min-h-11 text-xs px-3 py-1 rounded-xl bg-mint-100 text-mint-600 font-medium hover:bg-mint-200 disabled:opacity-40 transition-colors"
          >
            {sending ? "..." : "丢进去"}
          </button>
        </div>
      </div>
    </div>
  );
}
