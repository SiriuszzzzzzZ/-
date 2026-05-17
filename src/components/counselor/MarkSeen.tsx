"use client";
import { useEffect } from "react";

export function MarkSeen({ classId }: { classId: string }) {
  useEffect(() => {
    fetch(`/api/class/${classId}/mark-seen`, { method: "POST" });
  }, [classId]);

  return null;
}
