"use client";
import { useState, useCallback } from "react";

interface UseSubmitOptions {
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function useSubmit(fn: () => Promise<void>, opts?: UseSubmitOptions) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await fn();
      setStatus("success");
      opts?.onSuccess?.();
    } catch {
      setStatus("error");
      setErrorMsg("发送失败，请重试");
      opts?.onError?.("发送失败，请重试");
    }
  }, [fn, opts]);

  const reset = useCallback(() => setStatus("idle"), []);

  return { status, errorMsg, submit, reset };
}
