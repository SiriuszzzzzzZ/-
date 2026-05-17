"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationDot } from "@/components/ui";

const NAV_ITEMS = [
  { href: "", icon: "🏠", label: "班级" },
  { href: "/square", icon: "🌊", label: "广场" },
  { href: "/me", icon: "👤", label: "我的", hasNotification: true },
];

export function ClassNav({ classId }: { classId: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="主要导航" className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm border-t border-warm-200/50 px-3 py-2 pb-safe flex justify-around max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto z-10">
      {NAV_ITEMS.map((item) => {
        const itemPath = item.href.startsWith("/")
          ? item.href
          : `/class/${classId}${item.href ? `/${item.href}` : ""}`;
        const isActive = item.href === ""
          ? pathname === `/class/${classId}`
          : pathname.startsWith(`/class/${classId}${item.href}`);
        return (
          <Link
            key={item.label}
            href={itemPath}
            aria-current={isActive ? "page" : undefined}
            className={`tap-target flex flex-col items-center justify-center py-1 px-3 rounded-3xl transition-all duration-200 ${
              isActive
                ? "text-coral-500 bg-coral-50"
                : "text-warm-300 hover:text-warm-500"
            }`}
          >
            <span className="text-lg relative">
              {item.icon}
              {item.hasNotification && <NotificationDot />}
            </span>
            <span className="text-xs font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
