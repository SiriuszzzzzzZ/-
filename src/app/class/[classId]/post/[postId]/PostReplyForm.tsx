"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function PostReplyForm({ classId, postId }: { classId: string; postId: string }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!text.trim() && !image) return;
    setSending(true);
    const body: Record<string, unknown> = { classId, content: text.trim() || "📷", parentId: postId, type: "HELP_SKILL" };
    if (image) body.image = image;
    const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setText(""); setImage(null); router.refresh(); }
    setSending(false);
  }

  return (
    <div className="space-y-2 pt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写下你的回应...（也可以只发图片）"
        className="w-full rounded-2xl border border-warm-200 bg-white/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <ImageUpload image={image} setImage={setImage} />
        <button
          onClick={submit}
          disabled={(!text.trim() && !image) || sending}
          className="px-4 py-1.5 rounded-2xl bg-coral-100 text-coral-600 text-sm font-medium hover:bg-coral-200 disabled:opacity-40 transition-colors"
        >
          {sending ? "发送中..." : "回应"}
        </button>
      </div>
    </div>
  );
}
