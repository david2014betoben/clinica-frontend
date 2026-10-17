import { Link } from "react-router-dom";

export function PaginaNotFound() {
  const lineaCardiaca =
    "M0 60 H100 L120 60 L137 45 L153 76 L172 22 L191 96 L210 60 H300 L320 60 L337 48 L351 72 L368 60 H440 L458 60 L476 28 L493 91 L511 60 H600";

  return (
    <main className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
      <div
        aria-hidden="true"
        className="glow-orb glow-orb-indigo pointer-events-none absolute -top-24 left-1/3 size-72"
      />
      <div
        aria-hidden="true"
        className="glow-orb glow-orb-rose pointer-events-none absolute -bottom-20 right-1/4 size-64"
      />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="relative mb-6 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400">
              <span className="size-2 animate-pulse rounded-full bg-rose-500" />
              Ruta no encontrada
            </div>

            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              ERROR 404
            </span>
          </div>

          <div className="relative mt-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            <span
              aria-hidden="true"
              className="absolute text-7xl font-black tracking-widest text-slate-200/70 dark:text-slate-800/70"
            >
              404
            </span>

            <svg
              aria-label="Línea animada de monitor cardíaco"
              role="img"
              className="relative z-10 h-24 w-full"
              viewBox="0 0 600 120"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d={lineaCardiaca}
                stroke="rgba(99,102,241,0.22)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                className="ecg-sweep"
                d={lineaCardiaca}
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span
              aria-hidden="true"
              className="absolute right-4 top-4 size-2 animate-ping rounded-full bg-indigo-400"
            />
          </div>
        </div>

        <span className="mb-3 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          Página no disponible
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          No encontramos esta página
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
          La dirección que ingresaste no corresponde a una página disponible.
          Revisa la URL o vuelve al inicio.
        </p>

        <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <span aria-hidden="true">←</span>
            Ir al inicio
          </Link>

          <Link
            to="/pacientes"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Ver pacientes
          </Link>
        </div>
      </section>
    </main>
  );
}
