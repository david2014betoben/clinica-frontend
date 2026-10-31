interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: {
    label: string;
    onClick: () => void;
  };
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
        <svg
          aria-hidden="true"
          className="size-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h4" />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
        {titulo}
      </h2>

      {descripcion && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {descripcion}
        </p>
      )}

      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          {accion.label}
        </button>
      )}
    </section>
  );
}
