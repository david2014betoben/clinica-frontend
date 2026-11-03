import { useNavigate } from "react-router-dom";

import { useHistorialCitas } from "../features/citas/hooks/useHistorialCitas";
import type { Cita } from "../services/citas";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { EstadoVacio } from "../shared/components/ui/EstadoVacio";
import { SkeletonCitaRow } from "../shared/components/ui/Skeletons";

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(valor);
}

function formatearHora(hora: string): string {
  if (/^\d{2}:\d{2}/.test(hora)) {
    return hora.slice(0, 5);
  }

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

    case "programada":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function PaginaHistorialCitas() {
  const navigate = useNavigate();

  const {
    citas,
    cargando,
    error,
    pagina,
    totalPaginas,
    total,
    estado,
    estados,
    cambiarEstado,
    seleccionarEstado,
    cambiarPagina,
    recargar,
  } = useHistorialCitas();

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
            onChange={(evento) => seleccionarEstado(evento.target.value)}
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
        <AlertaBanner
          tipo="error"
          titulo="No se pudo cargar el historial"
          mensaje={error}
          accion={{
            label: "Reintentar",
            onClick: recargar,
          }}
        />
      ) : (
        <>
          <section
            aria-label="Listado del historial"
            aria-busy={cargando}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {cargando || citas.length > 0 ? (
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
                    {cargando
                      ? Array.from({ length: 10 }, (_, indice) => (
                          <SkeletonCitaRow key={indice} />
                        ))
                      : citas.map((cita) => (
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
                        ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4">
                <EstadoVacio
                  titulo={
                    pagina > totalPaginas
                      ? "Esta página no tiene citas"
                      : estado !== "Todos"
                        ? "No hay citas con este estado"
                        : "No hay citas registradas"
                  }
                  descripcion={
                    pagina > totalPaginas
                      ? "Vuelve a la primera página para consultar los resultados."
                      : estado !== "Todos"
                        ? "Selecciona otro estado o consulta todas las citas."
                        : "Agenda una cita para comenzar a construir el historial."
                  }
                  accion={
                    pagina > totalPaginas
                      ? {
                          label: "Volver a la primera página",
                          onClick: () => cambiarPagina(1),
                        }
                      : estado !== "Todos"
                        ? {
                            label: "Mostrar todas",
                            onClick: () => cambiarEstado("Todos"),
                          }
                        : {
                            label: "Nueva cita",
                            onClick: () => navigate("/citas/nueva"),
                          }
                  }
                />
              </div>
            )}

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
