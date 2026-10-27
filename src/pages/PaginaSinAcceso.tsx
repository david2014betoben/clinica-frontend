import { Link } from "react-router-dom";

export function PaginaSinAcceso() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <svg
            aria-hidden="true"
            className="size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Acceso restringido
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          No tienes acceso a esta sección
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Tu cuenta no tiene los permisos necesarios para ver esta página. Si
          necesitas acceso, contacta con el administrador.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
