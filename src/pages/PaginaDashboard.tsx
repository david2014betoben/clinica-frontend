import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { Metrica } from "../types";
import { StatusBadge } from "../componentes/StatusBadge";
import { extraerMensajeError } from "../lib/errorHandler";
import { useDashboardStore } from "../stores/dashboardStore";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { SkeletonMetricCard } from "../shared/components/ui/Skeletons";
import { Spinner } from "../shared/components/ui/Spinner";

const estilosPorTendencia: Record<
  Metrica["tendencia"],
  { icono: string; acento: string }
> = {
  positiva: {
    icono:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    acento: "text-emerald-600 dark:text-emerald-400",
  },
  neutra: {
    icono:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    acento: "text-blue-600 dark:text-blue-400",
  },
  negativa: {
    icono:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    acento: "text-amber-600 dark:text-amber-400",
  },
};

export function PaginaDashboard() {
  const [mantenimiento, setMantenimiento] = useState(false);

  const totales = useDashboardStore((state) => state.totales);
  const cargando = useDashboardStore((state) => state.cargando);
  const error = useDashboardStore((state) => state.error);
  const cargarMetricas = useDashboardStore((state) => state.cargarMetricas);

  const actualizarMetricas = useCallback(async () => {
    try {
      await cargarMetricas();
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  }, [cargarMetricas]);

  useEffect(() => {
    void actualizarMetricas();
  }, [actualizarMetricas]);

  const fechaActual = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    dateStyle: "long",
  }).format(new Date());

  const metricas: Metrica[] = [
    {
      id: "pacientes",
      titulo: "Pacientes",
      valor: totales?.pacientes ?? "—",
      descripcion: "Pacientes registrados",
      tendencia: "positiva",
      icono: "👥",
    },
    {
      id: "medicos",
      titulo: "Médicos",
      valor: totales?.medicos ?? "—",
      descripcion: "Médicos registrados",
      tendencia: "neutra",
      icono: "🩺",
    },
    {
      id: "programadas",
      titulo: "Citas programadas",
      valor: totales?.programadas ?? "—",
      descripcion: "Citas pendientes de atención de todas las fechas",
      tendencia: "negativa",
      icono: "📅",
    },
    {
      id: "completadas",
      titulo: "Completadas hoy",
      valor: totales?.completadas ?? "—",
      descripcion: "Citas de hoy con estado completada",
      tendencia: "positiva",
      icono: "✅",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1680px] min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>

            <StatusBadge activo={!mantenimiento} />
          </div>

          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Resumen general del sistema
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Hoy, {fechaActual}
          </span>

          <button
            type="button"
            disabled={cargando}
            onClick={() => void actualizarMetricas()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cargando && <Spinner mensaje="Actualizando métricas..." />}
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      <section
        aria-labelledby="mantenimiento-titulo"
        className={`rounded-xl border p-4 transition-colors ${
          mantenimiento
            ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              🛠️
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="mantenimiento-titulo"
                  className="font-semibold text-slate-900 dark:text-white"
                >
                  Estado de mantenimiento
                </h2>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    mantenimiento
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  }`}
                >
                  {mantenimiento ? "Activo" : "Inactivo"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {mantenimiento
                  ? "El sistema está en modo mantenimiento."
                  : "El sistema funciona con normalidad."}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-pressed={mantenimiento}
            onClick={() => setMantenimiento((actual) => !actual)}
            className={`rounded-lg px-4 py-2 font-semibold text-white transition ${
              mantenimiento
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            }`}
          >
            {mantenimiento
              ? "Desactivar mantenimiento"
              : "Activar mantenimiento"}
          </button>
        </div>
      </section>

      <section aria-label="Métricas del sistema" aria-busy={cargando}>
        {cargando ? (
          <>
            <span role="status" className="sr-only">
              Cargando métricas...
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, indice) => (
                <SkeletonMetricCard key={indice} />
              ))}
            </div>
          </>
        ) : error ? (
          <AlertaBanner
            tipo="error"
            titulo="No se pudieron cargar las métricas"
            mensaje="Comprueba tu conexión e intenta nuevamente."
            accion={{
              label: "Reintentar",
              onClick: () => void actualizarMetricas(),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metricas.map((metrica) => {
              const estilo = estilosPorTendencia[metrica.tendencia];

              return (
                <article
                  key={metrica.id}
                  className="flex min-h-44 min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 font-medium text-slate-600 dark:text-slate-300">
                      {metrica.titulo}
                    </h2>

                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl ${estilo.icono}`}
                    >
                      {metrica.icono}
                    </span>
                  </div>

                  <p
                    className={`mt-5 text-4xl font-bold tracking-tight ${estilo.acento}`}
                  >
                    {metrica.valor}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {metrica.descripcion}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
