"use client";
import { useEffect } from "react";
import Link from "next/link";
import { markNotificationsSeen } from "./NotificationDot";

interface Notification {
  type: "growth" | "reply";
  count?: number;
  postId?: string;
  classId?: string;
  content?: string;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  useEffect(() => {
    markNotificationsSeen();
    window.dispatchEvent(new Event("notifications-seen"));
  }, []);

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => {
        if (n.type === "growth" && n.count) {
          return (
            <Link
              key="growth"
              href="/me/growth"
              className="bg-coral-50 rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-up block hover:bg-coral-100 transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => {
                markNotificationsSeen();
                window.dispatchEvent(new Event("notifications-seen"));
              }}
            >
              <span className="text-lg">✨</span>
              <div className="flex-1">
                <p className="text-sm text-coral-600">本周被点亮 <span className="font-semibold">{n.count}</span> 次</p>
              </div>
              <span className="text-xs text-coral-400">查看 →</span>
            </Link>
          );
        }
        if (n.type === "reply" && n.postId) {
          return (
            <Link
              key={n.postId}
              href={`/class/${n.classId}/post/${n.postId}`}
              className="bg-coral-50 rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-up block hover:bg-coral-100 transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => {
                markNotificationsSeen();
                window.dispatchEvent(new Event("notifications-seen"));
              }}
            >
              <span className="text-lg">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-coral-600 truncate">{n.content}</p>
                <p className="text-xs text-coral-400 mt-0.5">收到了新回应</p>
              </div>
              <span className="text-xs text-coral-400 flex-shrink-0">查看 →</span>
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
}
