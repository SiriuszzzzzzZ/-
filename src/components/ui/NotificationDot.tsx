"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "notification_seen_at";

export function markNotificationsSeen() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

export function NotificationDot() {
  const [count, setCount] = useState(0);

  function fetchCount() {
    const since = localStorage.getItem(STORAGE_KEY) || "";
    const url = since ? `/api/me/notifications?since=${encodeURIComponent(since)}` : "/api/me/notifications";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setCount(d.total || 0))
      .catch(() => {});
  }

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for "seen" events from other components
  useEffect(() => {
    function handleSeen() { fetchCount(); }
    window.addEventListener("notifications-seen", handleSeen);
    return () => window.removeEventListener("notifications-seen", handleSeen);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral-400 text-white text-[9px] font-bold flex items-center justify-center animate-pop-spring">
      {count > 9 ? "9+" : count}
    </span>
  );
}
