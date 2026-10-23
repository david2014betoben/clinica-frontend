import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/axios";
import { BuscadorPacientes } from "../componentes/BuscadorPacientes";
import { PacienteCard } from "../componentes/PacienteCard";
import toast from "react-hot-toast";
import type { PacienteAPI } from "../types/paciente-api";
import { FormularioPaciente } from "../componentes/FormularioPaciente";
import { ModalConfirmacion } from "../componentes/ModalConfirmacion";
import { remove } from "../services/pacientes";
import { extraerMensajeError } from "../lib/errorHandler";

interface RespuestaPacientes {
  data: PacienteAPI[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function nombreCompleto(paciente: PacienteAPI): string {
  return [paciente.nombre, paciente.ap_paterno, paciente.ap_materno]
    .filter(Boolean)
    .join(" ");
}

export function PaginaPacientes() {
  const [pacientes, setPacientes] = useState<PacienteAPI[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] =
    useState<PacienteAPI | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarPacientes = useCallback(
    async (signal?: AbortSignal) => {
      setCargando(true);
      setError(false);

      try {
        const respuesta = await api.get<RespuestaPacientes>("/pacientes", {
          params: {
            page: pagina,
            limit: 10,
          },
          signal,
        });

        if (signal?.aborted) return;

        setPacientes(respuesta.data.data);
        setTotal(respuesta.data.total);
        setTotalPaginas(Math.max(1, respuesta.data.totalPages));
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
    },
    [pagina],
  );

  useEffect(() => {
    const controller = new AbortController();

    void cargarPacientes(controller.signal);

    return () => {
      controller.abort();
    };
  }, [cargarPacientes]);

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return pacientes.filter((paciente) =>
      [
        nombreCompleto(paciente),
        paciente.email ?? "",
        paciente.telefono ?? "",
      ].some((valor) => valor.toLowerCase().includes(termino)),
    );
  }, [pacientes, busqueda]);

  const claseBoton =
    "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  const pacienteCreado = (paciente: PacienteAPI) => {
    setPacientes((actuales) => [paciente, ...actuales]);
    setTotal(total + 1);
    setTotalPaginas(Math.max(1, Math.ceil((total + 1) / 10)));
    setBusqueda("");
  };

  const solicitarEliminacion = (id: string) => {
    const paciente = pacientes.find((item) => item.id === Number(id));

    if (paciente) {
      setPacienteAEliminar(paciente);
    }
  };

  const confirmarEliminacion = async () => {
    if (!pacienteAEliminar || eliminando) return;

    setEliminando(true);

    try {
      await remove(pacienteAEliminar.id);
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
      setEliminando(false);
      return;
    }

    const nuevoTotal = Math.max(0, total - 1);
    const nuevasPaginas = Math.max(1, Math.ceil(nuevoTotal / 10));

    setPacientes((actuales) =>
      actuales.filter((item) => item.id !== pacienteAEliminar.id),
    );
    setTotal(nuevoTotal);
    setTotalPaginas(nuevasPaginas);
    setPacienteAEliminar(null);
    setEliminando(false);

    toast.success("Paciente eliminado");

    // Si desapareció la última página, vuelve a una válida.
    if (pagina > nuevasPaginas) {
      setPagina(nuevasPaginas);
    } else {
      // Completa la página con los registros restantes del servidor.
      void cargarPacientes();
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Pacientes
          </h1>

          <p
            aria-live="polite"
            className="mt-2 text-sm text-slate-500 dark:text-slate-400"
          >
            {cargando
              ? "Cargando pacientes..."
              : error
                ? "No se pudo consultar el total de pacientes."
                : `${total} paciente(s) registrado(s)`}
          </p>
          <button
            type="button"
            disabled={cargando || error}
            onClick={() => setMostrarFormulario(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Agregar paciente
          </button>
        </header>

        {cargando ? (
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
            />
            <span>Cargando pacientes...</span>
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30"
          >
            <p className="font-medium text-rose-700 dark:text-rose-300">
              No se pudieron cargar los pacientes.
            </p>

            <button
              type="button"
              onClick={() => void cargarPacientes()}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </section>
        ) : (
          <>
            <section
              aria-label="Buscar pacientes"
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <BuscadorPacientes value={busqueda} onChange={setBusqueda} />

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Mostrando {pacientesFiltrados.length} de {pacientes.length}{" "}
                pacientes de esta página. La búsqueda se aplica a la página
                actual.
              </p>
            </section>

            {pacientesFiltrados.length > 0 ? (
              <section
                aria-label="Listado de pacientes"
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {pacientesFiltrados.map((paciente) => (
                  <PacienteCard
                    key={paciente.id}
                    paciente={{
                      id: String(paciente.id),
                      nombre: paciente.nombre,
                      apellido: [paciente.ap_paterno, paciente.ap_materno]
                        .filter(Boolean)
                        .join(" "),
                      email: paciente.email ?? "Sin información",
                      telefono: paciente.telefono ?? "Sin información",
                      especialidadAsignada: "Sin información",
                      ultimaCita: "Sin información",
                      estado: null,
                    }}
                    onEliminar={solicitarEliminacion}
                  />
                ))}
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-lg font-semibold">
                  No se encontraron pacientes
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {busqueda.trim()
                    ? "Prueba otra búsqueda en esta página."
                    : "No hay pacientes en esta página."}
                </p>
              </section>
            )}

            <nav
              aria-label="Paginación de pacientes"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <button
                type="button"
                disabled={pagina <= 1}
                onClick={() => {
                  setBusqueda("");
                  setPagina((actual) => actual - 1);
                }}
                className={claseBoton}
              >
                Anterior
              </button>

              <span className="text-sm text-slate-600 dark:text-slate-400">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => {
                  setBusqueda("");
                  setPagina((actual) => actual + 1);
                }}
                className={claseBoton}
              >
                Siguiente
              </button>
            </nav>
          </>
        )}
      </div>
      {mostrarFormulario && (
        <FormularioPaciente
          onCreado={pacienteCreado}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {pacienteAEliminar && (
        <ModalConfirmacion
          titulo="Eliminar paciente"
          mensaje={`¿Deseas eliminar a ${nombreCompleto(pacienteAEliminar)}? Esta acción no se puede deshacer.`}
          procesando={eliminando}
          onConfirmar={() => void confirmarEliminacion()}
          onCancelar={() => setPacienteAEliminar(null)}
        />
      )}
    </main>
  );
}
