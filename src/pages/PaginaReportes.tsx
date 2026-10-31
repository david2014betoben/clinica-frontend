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

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { EstadoVacio } from "../shared/components/ui/EstadoVacio";
import { ErrorBoundary } from "../shared/components/ui/ErrorBoundary";
import { Spinner } from "../shared/components/ui/Spinner";

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

interface ResultadoReportes {
  intento: number;
  especialidades: DatoEspecialidad[];
  citasPorDia: DatoDia[];
  error: string | null;
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
  const fechaBase = new Date(`${obtenerFechaBolivia()}T00:00:00.000Z`);

  const totalesPorFecha = new Map<string, number>();

  for (const cita of citas) {
    const fecha = cita.fecha.slice(0, 10);

    totalesPorFecha.set(fecha, (totalesPorFecha.get(fecha) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(fechaBase);

    fecha.setUTCDate(fecha.getUTCDate() - (6 - indice));

    const fechaTexto = fecha.toISOString().slice(0, 10);

    return {
      fecha: fechaTexto,
      etiqueta: new Intl.DateTimeFormat("es-BO", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(fecha),
      total: totalesPorFecha.get(fechaTexto) ?? 0,
    };
  });
}

function SkeletonGrafica() {
  return (
    <div
      aria-hidden="true"
      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="animate-pulse">
        <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-700" />

        <div className="mt-1 h-5 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-800" />

        <div className="mt-6 h-[300px] rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

const claseContenedor =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6";

const estiloTooltip = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "10px",
  color: "#f8fafc",
};

export function PaginaReportes() {
  const [intento, setIntento] = useState(0);

  const [resultado, setResultado] = useState<ResultadoReportes | null>(null);

  const cargando = resultado?.intento !== intento;
  const error = cargando ? null : resultado?.error;
  const especialidades = resultado?.especialidades ?? [];
  const citasPorDia = resultado?.citasPorDia ?? [];

  const hayCitasEnPeriodo = citasPorDia.some((dia) => dia.total > 0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarReportes() {
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

        setResultado({
          intento,
          especialidades: respuestaEspecialidades.data.data.map((item) => ({
            especialidad: item.especialidades,
            total: item.total_citas,
          })),
          citasPorDia: obtenerUltimosSieteDias(respuestaCitas.data.data),
          error: null,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setResultado({
          intento,
          especialidades: [],
          citasPorDia: [],
          error: extraerMensajeError(err),
        });
      }
    }

    void cargarReportes();

    return () => controller.abort();
  }, [intento]);

  const recargar = () => {
    setIntento((actual) => actual + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
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
            onClick={recargar}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cargando && <Spinner mensaje="Actualizando reportes..." />}

            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {cargando ? (
          <section aria-label="Reportes" aria-busy="true">
            <span role="status" className="sr-only">
              Cargando reportes...
            </span>

            <div className="grid gap-5 xl:grid-cols-2">
              <SkeletonGrafica />
              <SkeletonGrafica />
            </div>
          </section>
        ) : error ? (
          <AlertaBanner
            tipo="error"
            titulo="No se pudieron cargar los reportes"
            mensaje={error}
            accion={{
              label: "Reintentar",
              onClick: recargar,
            }}
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            <section className={claseContenedor}>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Citas por especialidad
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Total de citas registradas por especialidad.
              </p>

              <div className="mt-6 min-h-[300px] min-w-0">
                <ErrorBoundary
                  key={`especialidades-${intento}`}
                  fallback={
                    <AlertaBanner
                      tipo="error"
                      mensaje="No se pudo mostrar la gráfica de especialidades."
                      accion={{
                        label: "Reintentar",
                        onClick: recargar,
                      }}
                    />
                  }
                >
                  {especialidades.length === 0 ? (
                    <EstadoVacio
                      titulo="Sin citas por especialidad"
                      descripcion="La gráfica aparecerá cuando existan citas registradas."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={especialidades}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 55,
                        }}
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

                        <Tooltip
                          contentStyle={estiloTooltip}
                          labelStyle={{ color: "#f8fafc" }}
                          itemStyle={{ color: "#c7d2fe" }}
                        />

                        <Bar
                          dataKey="total"
                          name="Citas"
                          fill="#4f46e5"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ErrorBoundary>
              </div>
            </section>

            <section className={claseContenedor}>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Citas por día
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Citas con fecha de atención en los últimos siete días.
              </p>

              <div className="mt-6 min-h-[300px] min-w-0">
                <ErrorBoundary
                  key={`dias-${intento}`}
                  fallback={
                    <AlertaBanner
                      tipo="error"
                      mensaje="No se pudo mostrar la gráfica de citas por día."
                      accion={{
                        label: "Reintentar",
                        onClick: recargar,
                      }}
                    />
                  }
                >
                  {!hayCitasEnPeriodo ? (
                    <EstadoVacio
                      titulo="Sin citas en este período"
                      descripcion="No hay citas con fecha de atención en los últimos siete días."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={citasPorDia}
                        margin={{
                          top: 10,
                          right: 15,
                          left: 0,
                          bottom: 5,
                        }}
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

                        <Tooltip
                          contentStyle={estiloTooltip}
                          labelStyle={{ color: "#f8fafc" }}
                          itemStyle={{ color: "#c7d2fe" }}
                        />

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
                  )}
                </ErrorBoundary>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
