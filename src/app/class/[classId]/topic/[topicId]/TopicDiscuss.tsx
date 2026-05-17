"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Discussion {
  id: string;
  content: string;
  user: { name: string };
  createdAt: Date;
  image?: string | null;
}

export function TopicDiscuss({
  classId, topicId, initialDiscussions,
}: {
  classId: string; topicId: string;
  initialDiscussions: Discussion[];
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const router = useRouter();
  const { toast } = useToast();

  async function submit() {
    if (!text.trim() && !image) return;
    setSending(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        classId, content: text.trim() || "📷", type: "TOPIC_POST", topicId: topicId,
      };
      if (image) body.image = image;

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussions((prev) => [...prev, {
          id: data.post.id,
          content: text.trim() || "📷",
          user: { name: "我" },
          createdAt: new Date(),
          image: image,
        }]);
        setText("");
        setImage(null);
        router.refresh();
        toast("已参与讨论", "success");
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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setImage(data.url);
  }

  return (
    <div className="space-y-4">
      {/* 讨论列表 */}
      {discussions.length > 0 && (
        <div className="space-y-2">
          {discussions.map((d, i) => (
            <div key={d.id || i} className="bg-white/40 rounded-2xl px-4 py-3 animate-float-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-warm-600">{d.user.name}</span>
                <span className="text-[10px] text-warm-300">
                  {d.createdAt ? new Date(d.createdAt).toLocaleString("zh-CN") : "刚刚"}
                </span>
              </div>
              <p className="text-sm text-warm-600">{d.content}</p>
              {d.image && <img src={d.image} alt="" className="w-24 h-24 rounded-xl object-cover mt-2" />}
            </div>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <div className="space-y-2 sticky bottom-0 bg-cream/90 backdrop-blur-sm py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="说说你的想法..."
          className="w-full rounded-2xl border border-warm-200 bg-white/70 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none h-16"
          maxLength={200}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <div className="flex justify-between items-center">
          <div>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" id={`file-${topicId}`} />
            <label htmlFor={`file-${topicId}`} className="text-xs text-warm-400 hover:text-warm-600 cursor-pointer">
              {image ? "📷 已选图" : "📷 图片"}
            </label>
            {image && <button onClick={() => setImage(null)} className="text-[10px] text-warm-400 ml-2">×</button>}
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="text-[10px] text-coral-500">{error}</span>}
            <button
              onClick={submit}
              disabled={(!text.trim() && !image) || sending}
              className="px-4 py-1.5 rounded-2xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors active:scale-[0.97]"
            >
              {sending ? "..." : error ? "重试" : "发送"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
