import { useEffect, useMemo, useState } from "react";

import { BuscadorPacientes } from "../componentes/BuscadorPacientes";
import { PacienteCard } from "../componentes/PacienteCard";
import { FormularioPaciente } from "../componentes/FormularioPaciente";

import { usePacientesStore } from "../stores/pacientesStore";
import { useFiltrosStore } from "../stores/filtrosStore";

import type { PacienteAPI } from "../types/paciente-api";

function nombreCompleto(paciente: PacienteAPI): string {
  return [paciente.nombre, paciente.ap_paterno, paciente.ap_materno]
    .filter(Boolean)
    .join(" ");
}

export function PaginaPacientes() {
  const pacientes = usePacientesStore((state) => state.pacientes);
  const total = usePacientesStore((state) => state.total);
  const pagina = usePacientesStore((state) => state.pagina);
  const totalPaginas = usePacientesStore((state) => state.totalPaginas);
  const cargando = usePacientesStore((state) => state.cargando);
  const error = usePacientesStore((state) => state.error);
  const cargar = usePacientesStore((state) => state.cargar);

  const busqueda = useFiltrosStore((state) => state.queryPacientes);
  const setBusqueda = useFiltrosStore((state) => state.setQueryPacientes);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    void cargar(undefined, 1);
  }, [cargar]);

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
            disabled={cargando || Boolean(error)}
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

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void cargar(undefined, pagina)}
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
                  void cargar(undefined, pagina - 1);
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
                  void cargar(undefined, pagina + 1);
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
        <FormularioPaciente onCerrar={() => setMostrarFormulario(false)} />
      )}
    </main>
  );
}
