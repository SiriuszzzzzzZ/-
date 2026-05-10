import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings = { sm: "p-3", md: "p-4", lg: "p-6" };
  return (
    <div className={`bg-white rounded-xl border border-gray-100 ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
