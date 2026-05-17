"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export default function PageTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) setPrevPath(pathname);
  }, [pathname, prevPath]);

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
