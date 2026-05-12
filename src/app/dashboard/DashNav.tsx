"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationDot } from "@/components/ui";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📋", label: "仪表盘" },
  { href: "/square", icon: "🌊", label: "广场" },
  { href: "/me", icon: "👤", label: "我的", hasNotification: true },
];

export function DashNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-warm-200/50 px-3 py-2 flex justify-around max-w-lg mx-auto z-10">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-3xl transition-all duration-200 ${
              isActive ? "text-coral-500 bg-coral-50" : "text-warm-300 hover:text-warm-500"
            }`}
          >
            <span className="text-lg relative">
              {item.icon}
              {item.hasNotification && <NotificationDot />}
            </span>
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
