"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const COLORS = [
  { id: "coral", label: "暖橘", class: "bg-coral-400" },
  { id: "mint", label: "薄荷", class: "bg-mint-400" },
  { id: "peach", label: "蜜桃", class: "bg-peach-400" },
  { id: "purple", label: "薰衣草", class: "bg-purple-400" },
  { id: "amber", label: "阳光", class: "bg-amber-400" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(session?.user?.name || "");
  const [signature, setSignature] = useState("");
  const [themeColor, setThemeColor] = useState("coral");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [showPw, setShowPw] = useState(false);

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
    setAvatar(url);
  }

  async function saveProfile() {
    setSaving(true);
    setMsg("");
    try {
      const body: Record<string, string> = { name, signature, themeColor };
      if (avatar) body.avatar = avatar;
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      update();
      setMsg("保存成功");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPw || !newPw) return;
    setPwMsg("");
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg(data.error || "修改失败"); return; }
      setPwMsg("密码已修改");
      setCurrentPw(""); setNewPw("");
    } catch {
      setPwMsg("修改失败");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-warm-400 hover:text-warm-600 text-sm">← 返回</button>
        <h1 className="font-semibold text-warm-800 text-lg">设置</h1>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 space-y-6 pb-10">
        {/* 头像 */}
        <section className="bg-white/50 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-medium text-warm-600">头像</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-warm-100 overflow-hidden flex items-center justify-center text-2xl">
              {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : "📷"}
            </div>
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-warm-50 text-sm text-warm-500 hover:bg-warm-100 transition-colors">
              上传头像
            </button>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
          </div>
        </section>

        {/* 基本信息 */}
        <section className="bg-white/50 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-medium text-warm-600">个人信息</p>
          <div>
            <label className="text-xs text-warm-400">昵称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
              className="w-full mt-1 rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-300" />
          </div>
          <div>
            <label className="text-xs text-warm-400">签名</label>
            <input value={signature} onChange={(e) => setSignature(e.target.value)} maxLength={50} placeholder="写一句话..."
              className="w-full mt-1 rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300" />
          </div>
          <div>
            <p className="text-xs text-warm-400 mb-2">主题色</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c.id} onClick={() => setThemeColor(c.id)}
                  className={`w-8 h-8 rounded-xl ${c.class} transition-all ${themeColor === c.id ? "ring-2 ring-offset-2 ring-coral-300 scale-110" : "hover:scale-105"}`} />
              ))}
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving || !name.trim()}
            className="w-full py-2.5 rounded-xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-40 transition-colors active:scale-[0.98]">
            {saving ? "保存中..." : msg || "保存"}
          </button>
        </section>

        {/* 修改密码 */}
        <section className="bg-white/50 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-medium text-warm-600">修改密码</p>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="当前密码"
              className="w-full rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-300 pr-10" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 text-sm" aria-label={showPw ? "隐藏密码" : "显示密码"}>
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密码"
              className="w-full rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-300 pr-10" />
          </div>
          {pwMsg && <p className={`text-xs ${pwMsg.includes("已") ? "text-mint-500" : "text-coral-500"}`}>{pwMsg}</p>}
          <button onClick={changePassword} disabled={!currentPw || !newPw}
            className="w-full py-2.5 rounded-xl bg-warm-100 text-warm-600 text-sm font-medium hover:bg-warm-200 disabled:opacity-40 transition-colors">
            修改密码
          </button>
        </section>
      </main>
    </div>
  );
}
