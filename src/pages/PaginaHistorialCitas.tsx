import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getHistorial } from "../services/citas";
import type { Cita, EstadoHistorial } from "../services/citas";
import type { RespuestaPaginada } from "../types/api";
import { extraerMensajeError } from "../lib/errorHandler";

const estados: EstadoHistorial[] = [
  "Todos",
  "Programada",
  "Completada",
  "Cancelada",
];

function esEstadoHistorial(valor: string | null): valor is EstadoHistorial {
  return estados.some((estado) => estado === valor);
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(valor);
}

function formatearHora(hora: string): string {
  if (/^\d{2}:\d{2}/.test(hora)) return hora.slice(0, 5);

  const valor = new Date(hora);

  if (Number.isNaN(valor.getTime())) return "Sin hora";

  return new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(valor);
}

function nombreCompleto(persona: Cita["paciente"]): string {
  return [persona.nombre, persona.ap_paterno, persona.ap_materno]
    .filter(Boolean)
    .join(" ");
}

function estiloEstado(estado: Cita["estado"]): string {
  switch (estado) {
    case "completada":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "cancelada":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
    default:
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
  }
}

interface ResultadoCarga {
  clave: string;
  respuesta: RespuestaPaginada<Cita> | null;
  error: string | null;
}

export function PaginaHistorialCitas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);

  const paginaURL = Number(searchParams.get("pagina"));

  const pagina =
    Number.isSafeInteger(paginaURL) && paginaURL > 0 ? paginaURL : 1;

  const estadoURL = searchParams.get("estado");
  const estado: EstadoHistorial = esEstadoHistorial(estadoURL)
    ? estadoURL
    : "Todos";

  const clave = `${pagina}-${estado}-${intento}`;
  const cargando = resultado?.clave !== clave;
  const error = cargando ? null : resultado?.error;
  const respuesta = cargando ? null : resultado?.respuesta;

  const citas = respuesta?.data ?? [];
  const totalPaginas = respuesta?.totalPaginas ?? 1;
  const total = respuesta?.total ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const datos = await getHistorial({
          pagina,
          estado,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setResultado({
          clave,
          respuesta: datos,
          error: null,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setResultado({
          clave,
          respuesta: null,
          error: extraerMensajeError(err),
        });
      }
    }

    void cargar();

    return () => controller.abort();
  }, [pagina, estado, clave]);

  const cambiarEstado = (nuevoEstado: EstadoHistorial) => {
    setSearchParams({
      pagina: "1",
      estado: nuevoEstado,
    });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    setSearchParams({
      pagina: String(nuevaPagina),
      estado,
    });
  };

  const claseBoton =
    "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Historial de citas
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Consulta las citas registradas y filtra por su estado.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium">
          Estado
          <select
            value={estado}
            onChange={(evento) => {
              const valor = evento.target.value;

              if (esEstadoHistorial(valor)) {
                cambiarEstado(valor);
              }
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {estados.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error ? (
        <section
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30"
        >
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>

          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </section>
      ) : (
        <>
          <section
            aria-label="Listado del historial"
            aria-busy={cargando}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-4">
                      Paciente
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Médico
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Fecha
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Hora
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cargando ? (
                    Array.from({ length: 10 }, (_, indice) => (
                      <tr key={indice} className="h-20" aria-hidden="true">
                        {Array.from({ length: 5 }, (_, columna) => (
                          <td key={columna} className="px-5 py-4">
                            <div className="h-4 w-full max-w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : citas.length > 0 ? (
                    citas.map((cita) => (
                      <tr key={cita.id} className="h-20">
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                          {nombreCompleto(cita.paciente)}
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {nombreCompleto(cita.medico)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {formatearFecha(cita.fecha)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {formatearHora(cita.hora)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${estiloEstado(cita.estado)}`}
                          >
                            {cita.estado ?? "Sin estado"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-16 text-center text-slate-500 dark:text-slate-400"
                      >
                        No hay citas para esta página y filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {cargando && (
              <span role="status" className="sr-only">
                Cargando historial de citas...
              </span>
            )}
          </section>

          <nav
            aria-label="Paginación del historial"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <button
              type="button"
              disabled={pagina <= 1 || cargando}
              onClick={() => cambiarPagina(pagina - 1)}
              className={claseBoton}
            >
              ← Anterior
            </button>

            <p
              aria-live="polite"
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              {cargando
                ? "Cargando..."
                : `Página ${pagina} de ${totalPaginas} — ${total} registros`}
            </p>

            <button
              type="button"
              disabled={cargando || pagina >= totalPaginas}
              onClick={() => cambiarPagina(pagina + 1)}
              className={claseBoton}
            >
              Siguiente →
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
