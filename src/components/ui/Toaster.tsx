import { useToastStore, type ToastKind } from '@/stores/toastStore';

const kindStyles: Record<ToastKind, string> = {
  success: 'bg-go-soft text-go border-go/40',
  error: 'bg-signal-soft text-signal border-signal/40',
  info: 'bg-panel text-ink border-blueprint-2/50',
};

/** Fixed toast stack. Rendered once at the app root. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded border px-4 py-3 text-sm shadow ${kindStyles[t.kind]}`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
