"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <PageError />;
    }
    return this.props.children;
  }
}

export function PageError({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-3xl">🍃</p>
        <p className="text-sm text-warm-500">{message || "加载失败"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-2xl bg-coral-400 text-white text-sm hover:bg-coral-500 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
