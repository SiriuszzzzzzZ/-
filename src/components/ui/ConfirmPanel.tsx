"use client";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmPanel({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-warm-900/20 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl px-7 py-6 max-w-[280px] w-[85%] shadow-soft-lg text-center animate-pop-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] text-warm-700 leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl border border-warm-200 bg-white text-warm-500 text-sm transition-colors hover:bg-warm-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-coral-400 text-white text-sm font-medium transition-all active:scale-[0.96] hover:bg-coral-500"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
