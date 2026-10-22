import { useCallback, useEffect, useState } from "react";
import type { Metrica } from "../types";
import { StatusBadge } from "../componentes/StatusBadge";
import { api } from "../lib/axios";

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

type RespuestaListado = { data: unknown[]; total: number } | unknown[];

interface TotalesDashboard {
  pacientes: number;
  medicos: number;
  programadas: number;
  completadas: number;
}

function obtenerTotal(respuesta: RespuestaListado): number {
  return Array.isArray(respuesta) ? respuesta.length : respuesta.total;
}

export function PaginaDashboard() {
  const [mantenimiento, setMantenimiento] = useState(false);
  const [totales, setTotales] = useState<TotalesDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargarMetricas = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError(false);

    try {
      const [pacientes, medicos, programadas, completadas] = await Promise.all([
        api.get<RespuestaListado>("/pacientes", { signal }),
        api.get<RespuestaListado>("/medicos", { signal }),
        api.get<RespuestaListado>("/citas", {
          params: { estado: "programada" },
          signal,
        }),
        api.get<RespuestaListado>("/citas", {
          params: { estado: "Completada" },
          signal,
        }),
      ]);

      if (signal?.aborted) return;

      setTotales({
        pacientes: obtenerTotal(pacientes.data),
        medicos: obtenerTotal(medicos.data),
        programadas: obtenerTotal(programadas.data),
        completadas: obtenerTotal(completadas.data),
      });
    } catch {
      if (!signal?.aborted) {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void cargarMetricas(controller.signal);

    return () => {
      controller.abort();
    };
  }, [cargarMetricas]);

  const fechaActual = new Intl.DateTimeFormat("es-BO", {
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
      descripcion: "Citas pendientes de atención",
      tendencia: "negativa",
      icono: "📅",
    },
    {
      id: "completadas",
      titulo: "Citas completadas",
      valor: totales?.completadas ?? "—",
      descripcion: "Citas con estado completada",
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
            onClick={() => setMantenimiento((prev) => !prev)}
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
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
            />
            <span>Cargando métricas...</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30"
          >
            <p className="font-medium text-rose-700 dark:text-rose-300">
              No se pudieron cargar las métricas.
            </p>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Revisa que el backend esté encendido e intenta nuevamente.
            </p>

            <button
              type="button"
              onClick={() => void cargarMetricas()}
              className="mt-4 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metricas.map((metrica) => {
              const estilo = estilosPorTendencia[metrica.tendencia];

              return (
                <article
                  key={metrica.id}
                  className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 font-medium text-slate-600 dark:text-slate-300">
                      {metrica.titulo}
                    </h2>

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl ${estilo.icono}`}
                      aria-hidden="true"
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
