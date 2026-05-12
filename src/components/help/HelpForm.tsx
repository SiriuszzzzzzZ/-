"use client";
import { useState, useRef } from "react";

export function HelpForm({ classId, onSent }: { classId: string; onSent?: () => void }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ message: string; type: string; postId?: string } | null>(null);
  const [error, setError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function submit() {
    if (!content.trim()) return;
    setSending(true); setError(false);
    try {
      const body: Record<string, string | null> = { classId, content };
      if (image) body.image = image;
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      if (data.success) onSent?.();
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="bg-mint-50 rounded-3xl px-5 py-4 text-center animate-pop-spring space-y-2">
        <p className="text-lg">{result.type === "EMOTION" ? "🫂" : "📨"}</p>
        <p className="text-sm text-warm-600">{result.message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => setResult(null)} className="text-xs text-warm-400 hover:text-warm-600">换个方式说</button>
          <button onClick={async () => {
            if (result.postId) {
              await fetch("/api/help", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: result.postId, action: "withdraw" }) });
            }
            setResult(null); setContent(""); setImage(null);
          }} className="text-xs text-warm-400 hover:text-warm-600">先收回去</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="一句话求助：谁会做PPT？/ 今天有点想哭..."
        className="w-full rounded-2xl border border-warm-200 bg-white/50 px-4 py-3 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-20"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
          {image ? (
            <div className="relative">
              <img src={image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-[10px] shadow">×</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-warm-400 hover:text-warm-600">
              📷 图片
            </button>
          )}
          <span className="text-xs text-warm-300">{content.length}/200</span>
        </div>
        <button
          onClick={submit}
          disabled={sending || !content.trim()}
          className="px-4 py-1.5 rounded-2xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors active:scale-[0.97]"
        >
          {sending ? "发送中..." : error ? "重试" : "发出求助"}
        </button>
        {error && <span className="text-[10px] text-coral-500">发送失败</span>}
      </div>
    </div>
  );
}
