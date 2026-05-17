"use client";
import Link from "next/link";

export default function MeError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-3xl">🌱</p>
        <p className="text-sm text-warm-600">个人页面暂时无法加载</p>
        <p className="text-xs text-warm-400">{error.message.slice(0, 80)}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-coral-400 text-white text-sm hover:bg-coral-500 transition-colors">重试</button>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-warm-100 text-warm-600 text-sm hover:bg-warm-200 transition-colors">返回登录</Link>
        </div>
      </div>
    </div>
  );
}
