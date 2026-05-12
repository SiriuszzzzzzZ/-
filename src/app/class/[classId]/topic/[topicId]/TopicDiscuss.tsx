"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function TopicDiscuss({ classId, topicId }: { classId: string; topicId: string }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!text.trim() && !image) return;
    setSending(true);
    const body: Record<string, unknown> = { classId, content: text.trim() || "📷", type: "TOPIC_POST", parentId: topicId };
    if (image) body.image = image;
    await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setDone(true);
    setSending(false);
    router.refresh();
    setTimeout(() => { setDone(false); setText(""); setImage(null); }, 2000);
  }

  if (done) {
    return <p className="text-xs text-mint-500 text-center py-2 animate-pop-spring">已参与 ✓</p>;
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="说说你的想法...（也可以只发图片）"
        className="w-full rounded-2xl border border-warm-200 bg-white/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <ImageUpload image={image} setImage={setImage} />
        <button
          onClick={submit}
          disabled={(!text.trim() && !image) || sending}
          className="px-4 py-1.5 rounded-2xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
}
