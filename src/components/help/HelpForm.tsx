"use client";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

export function HelpForm({ classId, onSent }: { classId: string; onSent?: () => void }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ message: string; type: string; postId?: string } | null>(null);
  const [error, setError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    if (!content.trim() || sending) return;
    setSending(true); setError(false);
    try {
      const body: Record<string, string | null | boolean> = { classId, content };
      if (image) body.image = image;
      if (anonymous) body.anonymous = true;
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      toast("求助已发出", "success");
      if (data.success) onSent?.();
    } catch {
      setError(true);
      toast("发送失败", "error");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && content.trim() && !sending) {
      e.preventDefault();
      submit();
    }
  }

  if (result) {
    return (
      <div className="bg-mint-50 rounded-3xl px-5 py-4 text-center animate-pop-spring space-y-2">
        <span className="text-lg">{result.type === "EMOTION" ? "🫂" : "📨"}</span>
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
      <label htmlFor="help-content" className="visually-hidden">写下你的求助内容</label>
      <textarea
        id="help-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="一句话求助：谁会做PPT？/ 今天有点想哭..."
        aria-describedby={error ? "help-error" : "help-hint"}
        className="w-full rounded-2xl border border-warm-200 bg-white/50 px-4 py-3 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-20"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span id="help-hint" className="visually-hidden">可以选择匿名，也可以添加一张图片。按 Enter 发送，Shift 加 Enter 换行。</span>
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" aria-label="上传求助图片" />
          {image ? (
            <div className="relative">
              <img src={image} alt="已选择的求助配图" className="w-12 h-12 rounded-xl object-cover" />
              <button type="button" aria-label="移除求助图片" onClick={() => setImage(null)} className="absolute -top-3 -right-3 tap-target rounded-full bg-white text-sm shadow">×</button>
            </div>
          ) : (
            <button type="button" aria-label="添加求助图片" onClick={() => fileRef.current?.click()} className="min-h-11 px-2 text-xs text-warm-400 hover:text-warm-600">
              📷 图片
            </button>
          )}
          <span className="text-xs text-warm-300">{content.length}/200</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="min-h-11 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="w-4 h-4 rounded border-warm-300 text-coral-400 focus:ring-coral-300" />
            <span className="text-xs text-warm-500">匿名</span>
          </label>
          <button
            onClick={submit}
            disabled={sending || !content.trim()}
            className="min-h-11 px-4 py-1.5 rounded-2xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors active:scale-[0.97]"
          >
            {sending ? "发送中..." : error ? "重试" : "发出求助"}
          </button>
        </div>
        {error && <span id="help-error" role="alert" className="text-xs text-coral-500">发送失败，请检查网络后重试</span>}
      </div>
    </div>
  );
}
