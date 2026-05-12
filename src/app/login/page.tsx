"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("邮箱或密码错误");
    else {
      setEntering(true);
      setTimeout(() => { window.location.href = "/"; }, 1100);
    }
  }

  if (entering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-4 animate-float-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-b from-[#1C2840] to-[#3A5070] flex items-center justify-center animate-pulse">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="text-warm-500 text-sm">正在进入同窗小栈...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-coral-100/60 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-mint-100/60 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-peach-100/40 blur-2xl animate-fade-in" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-4xl bg-coral-100 mb-2">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-warm-800">同窗小栈</h1>
          <p className="text-sm text-warm-400">一个会呼吸的校园角落</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-4xl shadow-soft-lg p-8 space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-warm-600">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-warm-600">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent transition-shadow"
            />
          </div>
          {error && (
            <p className="text-xs text-coral-500 bg-coral-50 px-3 py-2 rounded-2xl">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-coral-400 hover:bg-coral-500 text-white font-medium py-2.5 px-4 rounded-2xl transition-all duration-200 hover:shadow-soft active:scale-[0.98]"
          >
            推开这扇门
          </button>
        </form>

        <p className="text-center text-xs text-warm-300">
          被看见 · 被理解 · 被允许缓慢成长
        </p>
      </div>
    </div>
  );
}
