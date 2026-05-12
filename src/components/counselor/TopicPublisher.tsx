"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TOPIC_TYPES = [
  { id: "topic", label: "话题", emoji: "💬" },
  { id: "micro", label: "微行动", emoji: "🏃" },
  { id: "notice", label: "公告", emoji: "📢" },
] as const;

export function TopicPublisher({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [topicType, setTopicType] = useState<string>("topic");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.url;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    setImage(url);
  }

  async function publish() {
    if (!title.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        title: title.trim(),
        content: content.trim() || null,
        tags,
        isMicroAction: topicType === "micro",
        isNotice: topicType === "notice",
        image,
      }),
    });
    if (res.ok) {
      setTitle(""); setContent(""); setTags(""); setImage(null); setOpen(false);
      router.refresh();
    }
    setSending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-coral-50 hover:bg-coral-100 text-coral-500 text-sm font-medium py-3 rounded-2xl transition-colors"
      >
        ✦ 发布话题 / 微行动 / 公告
      </button>
    );
  }

  return (
    <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3 animate-float-up">
      {/* 类型选择 */}
      <div className="flex gap-2">
        {TOPIC_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopicType(t.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              topicType === t.id ? "bg-coral-100 text-coral-600 font-medium" : "bg-warm-100 text-warm-400"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={topicType === "notice" ? "公告标题" : topicType === "micro" ? "微行动标题" : "话题标题"}
        className="w-full rounded-xl border border-warm-200 bg-white/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300"
        maxLength={50}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="补充描述（可选）"
        className="w-full rounded-xl border border-warm-200 bg-white/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
        maxLength={200}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="标签，逗号分隔"
        className="w-full rounded-xl border border-warm-200 bg-white/50 px-4 py-2 text-xs text-warm-600 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300"
      />

      {/* 图片上传 */}
      <div>
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
        {image ? (
          <div className="relative inline-block">
            <img src={image} alt="" className="w-20 h-20 rounded-xl object-cover" />
            <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full text-xs shadow">×</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="text-xs text-warm-400 hover:text-warm-600 flex items-center gap-1">
            📷 添加图片
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="text-xs text-warm-400 px-3 py-1">取消</button>
        <button
          onClick={publish}
          disabled={!title.trim() || sending}
          className="px-4 py-1.5 rounded-2xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors"
        >
          {sending ? "发布中..." : "发布"}
        </button>
      </div>
    </div>
  );
}
