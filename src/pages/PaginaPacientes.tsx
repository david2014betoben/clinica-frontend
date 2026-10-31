import { useEffect, useState } from "react";

import { BuscadorPacientes } from "../componentes/BuscadorPacientes";
import { PacienteCard } from "../componentes/PacienteCard";
import { FormularioPaciente } from "../componentes/FormularioPaciente";

import { useDebounce } from "../hooks/useDebounce";
import { usePacientesStore } from "../stores/pacientesStore";
import { useFiltrosStore } from "../stores/filtrosStore";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { EstadoVacio } from "../shared/components/ui/EstadoVacio";
import { SkeletonPacienteRow } from "../shared/components/ui/Skeletons";

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
  const resetFiltros = useFiltrosStore((state) => state.resetFiltros);

  const busquedaDebounced = useDebounce(busqueda, 350);
  const esperandoDebounce = busqueda !== busquedaDebounced;
  const buscando = cargando || esperandoDebounce;

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    void cargar(busquedaDebounced, 1);
  }, [cargar, busquedaDebounced]);

  const claseBoton =
    "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Pacientes
          </h1>

          <p
            aria-live="polite"
            className="mt-2 text-sm text-slate-500 dark:text-slate-400"
          >
            {buscando
              ? "Buscando pacientes..."
              : error
                ? "No se pudo consultar el total de pacientes."
                : busqueda.trim()
                  ? `${total} paciente(s) encontrado(s)`
                  : `${total} paciente(s) registrado(s)`}
          </p>

          <button
            type="button"
            disabled={buscando || Boolean(error)}
            onClick={() => setMostrarFormulario(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Agregar paciente
          </button>
        </header>

        <section
          aria-label="Buscar pacientes"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <BuscadorPacientes
                value={busqueda}
                onChange={setBusqueda}
                buscando={buscando}
              />
            </div>

            <button
              type="button"
              disabled={!busqueda}
              onClick={resetFiltros}
              className={claseBoton}
            >
              Limpiar filtros
            </button>
          </div>

          {!buscando && !error && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Mostrando {pacientes.length} de {total} paciente(s)
            </p>
          )}
        </section>

        <section aria-label="Resultados de pacientes" aria-busy={buscando}>
          {buscando ? (
            <>
              <span role="status" className="sr-only">
                Cargando pacientes...
              </span>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 10 }, (_, indice) => (
                  <SkeletonPacienteRow key={indice} />
                ))}
              </div>
            </>
          ) : error ? (
            <AlertaBanner
              tipo="error"
              titulo="No se pudieron cargar los pacientes"
              mensaje={error}
              accion={{
                label: "Reintentar",
                onClick: () => void cargar(busquedaDebounced, pagina),
              }}
            />
          ) : pacientes.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pacientes.map((paciente) => (
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
            </div>
          ) : (
            <EstadoVacio
              titulo={
                busqueda.trim()
                  ? "No se encontraron pacientes"
                  : total > 0
                    ? "No hay pacientes en esta página"
                    : "No hay pacientes registrados"
              }
              descripcion={
                busqueda.trim()
                  ? "Prueba con otro nombre o apellido, o limpia los filtros."
                  : total > 0
                    ? "Vuelve a la primera página para consultar los registros."
                    : "Agrega el primer paciente para comenzar."
              }
              accion={
                busqueda.trim()
                  ? {
                      label: "Limpiar filtros",
                      onClick: resetFiltros,
                    }
                  : total > 0
                    ? {
                        label: "Volver a la primera página",
                        onClick: () => void cargar(busquedaDebounced, 1),
                      }
                    : {
                        label: "Agregar paciente",
                        onClick: () => setMostrarFormulario(true),
                      }
              }
            />
          )}
        </section>

        {!error && (
          <nav
            aria-label="Paginación de pacientes"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <button
              type="button"
              disabled={buscando || pagina <= 1}
              onClick={() => void cargar(busquedaDebounced, pagina - 1)}
              className={claseBoton}
            >
              Anterior
            </button>

            <span
              aria-live="polite"
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              {buscando ? "Cargando..." : `Página ${pagina} de ${totalPaginas}`}
            </span>

            <button
              type="button"
              disabled={buscando || pagina >= totalPaginas}
              onClick={() => void cargar(busquedaDebounced, pagina + 1)}
              className={claseBoton}
            >
              Siguiente
            </button>
          </nav>
        )}
      </div>

      {mostrarFormulario && (
        <FormularioPaciente onCerrar={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
}
