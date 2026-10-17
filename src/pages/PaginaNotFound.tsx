import { Link } from "react-router-dom";

export function PaginaNotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="text-7xl" aria-hidden="true">
        🔎
      </span>

      <h1 className="mt-4 text-6xl font-bold text-slate-900 dark:text-white">
        404
      </h1>

      <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
        Lo sentimos, no encontramos la página que buscas.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Ir al inicio
      </Link>
    </section>
  );
}
