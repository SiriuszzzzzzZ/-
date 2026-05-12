"use client";
import { useRef } from "react";

export function ImageUpload({ image, setImage }: { image: string | null; setImage: (url: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

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
    <>
      <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
      {image ? (
        <div className="relative inline-block">
          <img src={image} alt="" className="w-16 h-16 rounded-xl object-cover" />
          <button
            onClick={() => setImage(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full text-[10px] shadow flex items-center justify-center leading-none"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-warm-400 hover:text-warm-600 flex items-center gap-1"
        >
          📷 图片
        </button>
      )}
    </>
  );
}
