"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function PostReplyForm({ classId, postId, parentType }: {
  classId: string; postId: string; parentType?: string;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setImage(data.url);
  }

  async function submit() {
    if (!text.trim() && !image) return;
    setSending(true);
    setError("");
    try {
      const replyType = parentType || "HELP_SKILL";
      const body: Record<string, unknown> = {
        classId, content: text.trim() || "📷", parentId: postId, type: replyType,
      };
      if (image) body.image = image;
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        setText("");
        setImage(null);
        router.refresh();
        toast("回应已发送", "success");
      } else {
        const data = await res.json();
        setError(data.error || "发送失败");
        toast(data.error || "发送失败", "error");
      }
    } catch {
      setError("网络错误，请重试");
      toast("网络错误", "error");
    }
    setSending(false);
  }

  return (
    <div className="space-y-2 pt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写下你的回应..."
        className="w-full rounded-2xl border border-warm-200 bg-white/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <div>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="reply-file" />
          <label htmlFor="reply-file" className="text-xs text-warm-400 hover:text-warm-600 cursor-pointer">
            {image ? "📷 已选图" : "📷 图片"}
          </label>
          {image && <button onClick={() => setImage(null)} className="text-[10px] text-warm-400 ml-2">×</button>}
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-[10px] text-coral-500">{error}</span>}
          <button
            onClick={submit}
            disabled={(!text.trim() && !image) || sending}
            className="px-4 py-1.5 rounded-2xl bg-coral-100 text-coral-600 text-sm font-medium hover:bg-coral-200 disabled:opacity-40 transition-colors"
          >
            {sending ? "发送中..." : error ? "重试" : "回应"}
          </button>
        </div>
      </div>
    </div>
  );
}
