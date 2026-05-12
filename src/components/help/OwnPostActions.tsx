"use client";
import { useState, useRef } from "react";
import { ConfirmPanel } from "@/components/ui";

export function DeletePostButton({ postId }: { postId: string; classId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState<"shown" | "undo" | "deleted">("shown");
  const undoTimer = useRef<ReturnType<typeof setTimeout>>();

  function startDelete() {
    setConfirm(false);
    setState("undo");
    undoTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/help", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, action: "withdraw" }),
        });
      } catch { /* keep showing undo */ }
      setState("deleted");
    }, 4000);
  }

  function undo() {
    clearTimeout(undoTimer.current);
    setState("shown");
  }

  if (state === "deleted") return null;

  if (state === "undo") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-warm-400">已收回</span>
        <button onClick={(e) => { e.stopPropagation(); undo(); }} className="text-[10px] text-coral-400 hover:text-coral-500 font-medium">
          撤销
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
        className="text-[10px] text-warm-300 hover:text-coral-400 transition-colors ml-auto flex-shrink-0"
      >
        收回
      </button>
      {confirm && (
        <ConfirmPanel
          message="收回这条内容？"
          onConfirm={startDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  );
}
