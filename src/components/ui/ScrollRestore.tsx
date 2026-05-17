"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll:${pathname}`);
    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(saved, 10));
      });
    }

    const handleScroll = () => {
      sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
