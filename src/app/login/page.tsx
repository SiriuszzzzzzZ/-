"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("邮箱或密码错误");
    else window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">辅导员平台</h1>
          <p className="text-sm text-gray-400 mt-1">低压力关系基础设施</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Input label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full">登录</Button>
        </form>
      </div>
    </div>
  );
}
