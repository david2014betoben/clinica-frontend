import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  getAll,
  updateEstado,
  type Cita,
  type EstadoCita,
  type NuevoEstadoCita,
} from "../services/citas";
import { extraerMensajeError } from "../lib/errorHandler";

type FiltroEstado = EstadoCita | "todas";

interface CambioEstado {
  id: number;
  estado: NuevoEstadoCita;
}

interface Persona {
  nombre: string;
  ap_paterno: string;
  ap_materno: string | null;
}

const filtrosEstado: {
  valor: FiltroEstado;
  texto: string;
}[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "programada", texto: "Programadas" },
  { valor: "completada", texto: "Completadas" },
  { valor: "cancelada", texto: "Canceladas" },
];

const estilosEstado = {
  programada: {
    texto: "Programada",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300",
    punto: "bg-blue-500",
  },
  completada: {
    texto: "Completada",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
    punto: "bg-emerald-500",
  },
  cancelada: {
    texto: "Cancelada",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
    punto: "bg-rose-500",
  },
};

function nombreCompleto(persona: Persona): string {
  return [persona.nombre, persona.ap_paterno, persona.ap_materno]
    .filter(Boolean)
    .join(" ");
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(fecha));
}

function iniciales(persona: Persona): string {
  return `${persona.nombre.charAt(0)}${persona.ap_paterno.charAt(0)}`.toUpperCase();
}

function BadgeEstado({ estado }: { estado: Cita["estado"] }) {
  const estilo = estado
    ? estilosEstado[estado]
    : {
        texto: "Sin estado",
        badge:
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        punto: "bg-slate-400",
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${estilo.badge}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${estilo.punto}`}
      />
      {estilo.texto}
    </span>
  );
}

interface AccionEstadoProps {
  cita: Cita;
  guardando: boolean;
  onCambiar: (id: number, estado: NuevoEstadoCita) => void;
}

function AccionEstado({ cita, guardando, onCambiar }: AccionEstadoProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <select
        aria-label={`Estado de la cita de ${nombreCompleto(cita.paciente)}`}
        value={cita.estado ?? ""}
        disabled={guardando}
        onChange={(evento) => {
          const estado = evento.target.value;

          if (estado === "completada" || estado === "cancelada") {
            onCambiar(cita.id, estado);
          }
        }}
        className="h-9 max-w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <option value="" disabled>
          Seleccionar
        </option>
        <option value="programada" disabled>
          Programada
        </option>
        <option value="completada">Completada</option>
        <option value="cancelada">Cancelada</option>
      </select>

      {guardando && (
        <span
          role="status"
          className="text-[11px] text-indigo-600 dark:text-indigo-300"
        >
          Guardando…
        </span>
      )}
    </div>
  );
}

function SkeletonCitas() {
  return (
    <div
      role="status"
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111827]"
    >
      <span className="sr-only">Cargando citas...</span>

      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />

        {Array.from({ length: 6 }, (_, indice) => (
          <div
            key={indice}
            className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0 dark:border-slate-800"
          >
            <div className="size-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 max-w-40 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="hidden h-3 w-32 rounded bg-slate-200 dark:bg-slate-700 md:block" />
            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaginaCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todas");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  const [pendientes, setPendientes] = useState<number[]>([]);
  const bloqueos = useRef(new Set<number>());

  const [citasOptimistas, aplicarCambioOptimista] = useOptimistic(
    citas,
    (actuales: Cita[], cambio: CambioEstado): Cita[] =>
      actuales.map((cita) =>
        cita.id === cambio.id ? { ...cita, estado: cambio.estado } : cita,
      ),
  );

  const cargarCitas = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError(false);

    try {
      const datos = await getAll(signal);

      if (!signal?.aborted) {
        setCitas(datos);
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        setError(true);
        toast.error(extraerMensajeError(err));
      }
    } finally {
      if (!signal?.aborted) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void cargarCitas(controller.signal);

    return () => controller.abort();
  }, [cargarCitas]);

  const cambiarEstado = (id: number, nuevoEstado: NuevoEstadoCita) => {
    const citaActual = citas.find((cita) => cita.id === id);

    if (
      !citaActual ||
      citaActual.estado === nuevoEstado ||
      bloqueos.current.has(id)
    ) {
      return;
    }

    bloqueos.current.add(id);
    setPendientes((actuales) => [...actuales, id]);

    startTransition(async () => {
      aplicarCambioOptimista({ id, estado: nuevoEstado });

      try {
        await updateEstado(id, nuevoEstado);

        startTransition(() => {
          setCitas((actuales) =>
            actuales.map((cita) =>
              cita.id === id ? { ...cita, estado: nuevoEstado } : cita,
            ),
          );
        });

        toast.success("Estado de cita actualizado");
      } catch (err: unknown) {
        toast.error(`Cambio revertido: ${extraerMensajeError(err)}`);
      } finally {
        bloqueos.current.delete(id);
        setPendientes((actuales) =>
          actuales.filter((pendiente) => pendiente !== id),
        );
      }
    });
  };

  const citasFiltradas = useMemo(() => {
    const termino = normalizar(busqueda);

    return citasOptimistas.filter((cita) => {
      const coincideBusqueda =
        normalizar(nombreCompleto(cita.paciente)).includes(termino) ||
        normalizar(nombreCompleto(cita.medico)).includes(termino);

      const coincideEstado =
        estadoFiltro === "todas" || cita.estado === estadoFiltro;

      const coincideFecha =
        fechaFiltro === "" || cita.fecha.slice(0, 10) === fechaFiltro;

      return coincideBusqueda && coincideEstado && coincideFecha;
    });
  }, [citasOptimistas, busqueda, estadoFiltro, fechaFiltro]);

  const limite = 10;
  const totalPaginas = Math.max(1, Math.ceil(citasFiltradas.length / limite));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * limite;
  const citasPagina = citasFiltradas.slice(inicio, inicio + limite);

  const hayFiltros =
    busqueda.trim() !== "" || estadoFiltro !== "todas" || fechaFiltro !== "";

  function limpiarFiltros() {
    setBusqueda("");
    setEstadoFiltro("todas");
    setFechaFiltro("");
    setPagina(1);
  }

  const claseBoton =
    "inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 dark:bg-[#0b1120] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-bold tracking-tight text-slate-950 dark:text-slate-50">
                Citas
              </h1>

              {!cargando && !error && (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {citas.length} citas registradas
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Consulta y gestiona las citas de tus pacientes
            </p>
          </div>

          <button
            type="button"
            disabled={cargando || pendientes.length > 0}
            onClick={() => void cargarCitas()}
            className={claseBoton}
          >
            {cargando ? "Actualizando…" : "Actualizar"}
          </button>
        </header>

        <section
          aria-label="Filtros de citas"
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-4"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                type="search"
                aria-label="Buscar por paciente o médico"
                placeholder="Buscar por paciente o médico…"
                value={busqueda}
                onChange={(evento) => {
                  setBusqueda(evento.target.value);
                  setPagina(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrar por estado"
              className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 sm:flex"
            >
              {filtrosEstado.map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  aria-pressed={estadoFiltro === filtro.valor}
                  onClick={() => {
                    setEstadoFiltro(filtro.valor);
                    setPagina(1);
                  }}
                  className={`rounded-md px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    estadoFiltro === filtro.valor
                      ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-900 dark:text-indigo-200"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`}
                >
                  {filtro.texto}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                aria-label="Filtrar por fecha de cita"
                value={fechaFiltro}
                onChange={(evento) => {
                  setFechaFiltro(evento.target.value);
                  setPagina(1);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:[color-scheme:dark]"
              />

              <button
                type="button"
                disabled={!hayFiltros}
                onClick={limpiarFiltros}
                className={`${claseBoton} h-10`}
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        {cargando ? (
          <SkeletonCitas />
        ) : error ? (
          <section
            role="alert"
            className="rounded-xl border border-rose-200 bg-white px-5 py-14 text-center dark:border-rose-950 dark:bg-[#111827]"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Error al cargar las citas
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              No pudimos obtener los datos. Comprueba la conexión e intenta
              nuevamente.
            </p>

            <button
              type="button"
              onClick={() => void cargarCitas()}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </section>
        ) : citasFiltradas.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center dark:border-slate-800 dark:bg-[#111827]">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {citas.length === 0 ? "＋" : "⌕"}
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {citas.length === 0
                ? "Sin citas registradas"
                : "Sin resultados de búsqueda"}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {citas.length === 0
                ? "Agenda una cita con el botón Nueva cita del menú."
                : "Prueba otro nombre, estado o fecha."}
            </p>

            {hayFiltros && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className={`${claseBoton} mt-5`}
              >
                Restablecer filtros
              </button>
            )}
          </section>
        ) : (
          <section
            aria-label="Listado de citas"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827]"
          >
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <caption className="sr-only">
                  Citas filtradas por paciente, médico, estado y fecha
                </caption>

                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-400">
                  <tr>
                    <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                      Paciente
                    </th>
                    <th scope="col" className="w-[23%] px-4 py-3 font-semibold">
                      Médico
                    </th>
                    <th scope="col" className="w-[15%] px-4 py-3 font-semibold">
                      Fecha
                    </th>
                    <th scope="col" className="w-[9%] px-3 py-3 font-semibold">
                      Hora
                    </th>
                    <th scope="col" className="w-[13%] px-3 py-3 font-semibold">
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="w-[13%] px-3 py-3 text-right font-semibold"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {citasPagina.map((cita) => (
                    <tr
                      key={cita.id}
                      aria-busy={pendientes.includes(cita.id)}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                            {iniciales(cita.paciente)}
                          </span>

                          <div className="min-w-0">
                            <p
                              title={nombreCompleto(cita.paciente)}
                              className="truncate font-semibold text-slate-800 dark:text-slate-100"
                            >
                              {nombreCompleto(cita.paciente)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Cita #{cita.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <p className="break-words">
                          {nombreCompleto(cita.medico)}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {formatearFecha(cita.fecha)}
                      </td>

                      <td className="px-3 py-4 font-mono text-xs font-medium">
                        {cita.hora.slice(11, 16)}
                      </td>

                      <td className="px-3 py-4">
                        <BadgeEstado estado={cita.estado} />
                      </td>

                      <td className="px-3 py-4">
                        <AccionEstado
                          cita={cita}
                          guardando={pendientes.includes(cita.id)}
                          onCambiar={cambiarEstado}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
              {citasPagina.map((cita) => (
                <article
                  key={cita.id}
                  aria-busy={pendientes.includes(cita.id)}
                  className="space-y-4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        {iniciales(cita.paciente)}
                      </span>

                      <div className="min-w-0">
                        <h2 className="break-words text-sm font-semibold">
                          {nombreCompleto(cita.paciente)}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                          Cita #{cita.id}
                        </p>
                      </div>
                    </div>

                    <BadgeEstado estado={cita.estado} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <dt className="text-slate-400">Médico</dt>
                      <dd className="mt-1 text-slate-700 dark:text-slate-200">
                        {nombreCompleto(cita.medico)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-400">Fecha</dt>
                      <dd className="mt-1">{formatearFecha(cita.fecha)}</dd>
                    </div>

                    <div>
                      <dt className="text-slate-400">Hora</dt>
                      <dd className="mt-1 font-mono">
                        {cita.hora.slice(11, 16)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Cambiar estado
                    </span>

                    <AccionEstado
                      cita={cita}
                      guardando={pendientes.includes(cita.id)}
                      onCambiar={cambiarEstado}
                    />
                  </div>
                </article>
              ))}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-[#0f172a]">
              <p
                aria-live="polite"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Mostrando{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {inicio + 1}–{inicio + citasPagina.length}
                </span>{" "}
                de {citasFiltradas.length} citas
              </p>

              <nav
                aria-label="Paginación de citas"
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  disabled={paginaActual <= 1}
                  onClick={() => setPagina(paginaActual - 1)}
                  className={claseBoton}
                >
                  Anterior
                </button>

                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {paginaActual} / {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                  className={claseBoton}
                >
                  Siguiente
                </button>
              </nav>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}
