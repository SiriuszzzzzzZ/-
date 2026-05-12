"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full bg-white/60 rounded-2xl p-4 shadow-soft hover:shadow-soft-lg transition-all duration-200 text-center"
    >
      <span className="text-sm text-warm-400">退出登录</span>
    </button>
  );
}
