interface SpinnerProps {
  fullscreen?: boolean;
  mensaje?: string;
}

export function Spinner({
  fullscreen = false,
  mensaje = "Cargando...",
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80"
          : "inline-flex items-center justify-center"
      }
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-2 border-current border-r-transparent text-indigo-600 dark:text-indigo-400 ${
          fullscreen ? "size-10" : "size-4"
        }`}
      />

      <span className="sr-only">{mensaje}</span>
    </div>
  );
}
