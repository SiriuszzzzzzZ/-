"use client";
import { useState } from "react";

const PRESET_TAGS = ["考研心情", "第一次", "低谷", "温暖瞬间", "成长记录"];

export function SquareTopicForm({ classes, onClose, onSent }: { classes: { id: string; name: string }[]; onClose: () => void; onSent: () => void }) {
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"topic" | "micro" | "notice">("topic");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleTag(tag: string) {
    const current = tags.split(",").filter(Boolean);
    if (current.includes(tag)) {
      setTags(current.filter((t) => t !== tag).join(","));
    } else {
      setTags([...current, tag].join(","));
    }
  }

  async function submit() {
    if (!title.trim() || !classId) return;
    setSending(true);
    const body: Record<string, unknown> = {
      classId,
      title: title.trim(),
      content: content.trim() || null,
      tags,
      isMicroAction: type === "micro",
      isNotice: type === "notice",
      syncedToSquare: true,
    };
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTitle("");
      setContent("");
      setTags("");
      setType("topic");
      onSent();
    }, 1500);
    setSending(false);
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-warm-900/10 backdrop-blur-sm">
        <div className="bg-white rounded-3xl px-6 py-8 shadow-soft-lg text-center space-y-3 animate-pop-spring">
          <p className="text-3xl">✨</p>
          <p className="text-sm text-warm-600">话题已推送到广场</p>
          <p className="text-xs text-warm-400">同学们现在可以看到了</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-warm-900/10 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-4xl sm:rounded-4xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-soft-lg p-6 space-y-4 animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-warm-800">发布话题到广场</h3>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-600 text-lg">×</button>
        </div>

        {/* 类型选择 */}
        <div className="flex gap-2">
          {[
            { key: "topic", label: "💬 话题" },
            { key: "micro", label: "🏃 微行动" },
            { key: "notice", label: "📢 公告" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setType(opt.key as typeof type)}
              className={`flex-1 py-2 rounded-2xl text-sm transition-colors ${
                type === opt.key
                  ? "bg-coral-100 text-coral-500 font-medium"
                  : "bg-warm-50 text-warm-400 hover:bg-warm-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 班级选择 */}
        <div>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-300"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="话题标题"
          className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300"
          maxLength={100}
        />

        {/* 描述 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么吧（可选）"
          className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-3 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-20"
          maxLength={300}
        />

        {/* 标签 */}
        <div>
          <p className="text-xs text-warm-400 mb-2">选择标签（可多选）</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const active = tags.split(",").filter(Boolean).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    active
                      ? "bg-coral-100 text-coral-500 border border-coral-200"
                      : "bg-warm-50 text-warm-400 border border-warm-100 hover:border-coral-200"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 提交 */}
        <button
          onClick={submit}
          disabled={sending || !title.trim() || !classId}
          className="w-full py-2.5 rounded-2xl bg-coral-400 text-white font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors"
        >
          {sending ? "发布中..." : "推送到广场 ✨"}
        </button>
      </div>
    </div>
  );
}
