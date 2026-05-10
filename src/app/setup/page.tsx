"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const COLORS = [
  { id: "blue", label: "蓝", class: "bg-blue-500" },
  { id: "green", label: "绿", class: "bg-green-500" },
  { id: "purple", label: "紫", class: "bg-purple-500" },
  { id: "rose", label: "粉", class: "bg-rose-400" },
  { id: "amber", label: "暖", class: "bg-amber-400" },
];

export default function SetupPage() {
  const [color, setColor] = useState("blue");
  const [signature, setSignature] = useState("");

  async function finish() {
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeColor: color, signature }),
    });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">装扮你的空间</h1>
          <p className="text-sm text-gray-400 mt-1">选择一个颜色，写一句签名</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">主题色</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c.id} onClick={() => setColor(c.id)} className={`w-8 h-8 rounded-full ${c.class} ${color === c.id ? "ring-2 ring-offset-2 ring-indigo-400" : ""}`} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">签名</p>
            <input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="写一句话..." className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" maxLength={50} />
          </div>
          <Button onClick={finish} className="w-full">进入班级</Button>
        </div>
      </div>
    </div>
  );
}
