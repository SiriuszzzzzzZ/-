import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-warm-600">{label}</label>}
      <input className={`w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent transition-shadow ${className}`} {...props} />
    </div>
  );
}
