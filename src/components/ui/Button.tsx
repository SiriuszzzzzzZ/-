import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-coral-400 text-white hover:bg-coral-500 shadow-soft hover:shadow-soft-lg active:scale-[0.98] transition-all duration-200",
  secondary: "bg-warm-100 text-warm-700 hover:bg-warm-200",
  ghost: "bg-transparent text-warm-400 hover:text-warm-600 hover:bg-warm-50",
  danger: "bg-coral-50 text-coral-500 hover:bg-coral-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
