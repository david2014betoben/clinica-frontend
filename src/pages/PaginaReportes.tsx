import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";
import type { Cita } from "../services/citas";

interface EspecialidadAPI {
  especialidades: string;
  total_citas: number;
}

interface RespuestaEspecialidades {
  message: string;
  data: EspecialidadAPI[];
}

interface RespuestaCitas {
  data: Cita[];
  total: number;
}

interface DatoEspecialidad {
  especialidad: string;
  total: number;
}

interface DatoDia {
  fecha: string;
  etiqueta: string;
  total: number;
}

function obtenerFechaBolivia(): string {
  const partes = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const anio = partes.find((parte) => parte.type === "year")?.value;
  const mes = partes.find((parte) => parte.type === "month")?.value;
  const dia = partes.find((parte) => parte.type === "day")?.value;

  return `${anio}-${mes}-${dia}`;
}

function obtenerUltimosSieteDias(citas: Cita[]): DatoDia[] {
  const hoy = obtenerFechaBolivia();
  const fechaBase = new Date(`${hoy}T00:00:00.000Z`);

  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(fechaBase);

    fecha.setUTCDate(fecha.getUTCDate() - (6 - indice));

    const fechaTexto = fecha.toISOString().slice(0, 10);

    const etiqueta = new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(fecha);

    return {
      fecha: fechaTexto,
      etiqueta,
      total: citas.filter((cita) => cita.fecha.slice(0, 10) === fechaTexto)
        .length,
    };
  });
}

function SkeletonGrafica() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="sr-only">Cargando gráfica...</span>

      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="mt-6 h-[300px] rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

const claseContenedor =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6";

export function PaginaReportes() {
  const [especialidades, setEspecialidades] = useState<DatoEspecialidad[]>([]);

  const [citasPorDia, setCitasPorDia] = useState<DatoDia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarReportes() {
      setCargando(true);
      setError(null);

      try {
        const [respuestaEspecialidades, respuestaCitas] = await Promise.all([
          api.get<RespuestaEspecialidades>(
            "/citas/reports/citas_especialidad",
            { signal: controller.signal },
          ),

          api.get<RespuestaCitas>("/citas", {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        setEspecialidades(
          respuestaEspecialidades.data.data.map((item) => ({
            especialidad: item.especialidades,
            total: item.total_citas,
          })),
        );

        setCitasPorDia(obtenerUltimosSieteDias(respuestaCitas.data.data));
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(extraerMensajeError(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void cargarReportes();

    return () => controller.abort();
  }, [intento]);

  const hayCitasEnPeriodo = citasPorDia.some((dia) => dia.total > 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Reportes
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Consulta las citas por especialidad y su evolución durante los
              últimos siete días.
            </p>
          </div>

          <button
            type="button"
            disabled={cargando}
            onClick={() => setIntento((actual) => actual + 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {cargando ? (
          <div className="grid gap-5 xl:grid-cols-2">
            <SkeletonGrafica />
            <SkeletonGrafica />
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30"
          >
            <h2 className="font-semibold text-rose-700 dark:text-rose-300">
              No se pudieron cargar los reportes
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setIntento((actual) => actual + 1)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </section>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            <section className={claseContenedor}>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Citas por especialidad
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Total de citas registradas por especialidad.
              </p>

              {especialidades.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                  No hay citas por especialidad para mostrar.
                </div>
              ) : (
                <div className="mt-6 min-w-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={especialidades}
                      margin={{ top: 10, right: 10, left: 0, bottom: 55 }}
                    >
                      <CartesianGrid
                        stroke="#94a3b8"
                        strokeOpacity={0.2}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="especialidad"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        width={35}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="total"
                        name="Citas"
                        fill="#4f46e5"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className={claseContenedor}>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Citas por día
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Citas agendadas durante los últimos siete días.
              </p>

              {!hayCitasEnPeriodo ? (
                <div className="flex h-[300px] items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                  No hay citas en los últimos siete días.
                </div>
              ) : (
                <div className="mt-6 min-w-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={citasPorDia}
                      margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        stroke="#94a3b8"
                        strokeOpacity={0.2}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="etiqueta"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        width={35}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Citas"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ fill: "#6366f1", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
