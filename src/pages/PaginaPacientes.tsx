// Problemas encontrados en el codigo generado por la ia:
// 1. Los pacientes de ejemplo estan definidos en el mismo archivo que la pagina, lo que dificulta separar los datos de la interfaz.
// 2. Los cambios se guardan solo en el estado local de react; al recargar la pagina, se pierden los pacientes agregados, eliminados o modificados.
// 3. PaginaPacientes concentra varias tareas: busqueda, filtros, formulario, registro y eliminacion de pacientes. Podrian separarse en componentes o funciones.

import { useMemo, useState } from "react";
import type { EstadoPaciente } from "../types/paciente";
import { BuscadorPacientes } from "../componentes/BuscadorPacientes";
import { FiltroEstadoPacientes } from "../componentes/FiltroEstadoPacientes";
import { PacienteCard } from "../componentes/PacienteCard";
import { pacientesIniciales } from "../data/pacientes";

type EstadoFiltro = EstadoPaciente | "todos";

export function PaginaPacientes() {
  const [pacientes] = useState(pacientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<EstadoFiltro>("todos");

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    return pacientes.filter((paciente) => {
      const nombreCompleto =
        `${paciente.nombre} ${paciente.apellido}`.toLowerCase();

      const coincideBusqueda =
        nombreCompleto.includes(termino) ||
        paciente.email.toLowerCase().includes(termino) ||
        paciente.especialidadAsignada.toLowerCase().includes(termino);

      const coincideEstado =
        estadoSeleccionado === "todos" ||
        paciente.estado === estadoSeleccionado;

      return coincideBusqueda && coincideEstado;
    });
  }, [pacientes, busqueda, estadoSeleccionado]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Pacientes
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consulta y busca los pacientes registrados.
          </p>
        </header>

        <section className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <BuscadorPacientes value={busqueda} onChange={setBusqueda} />
          </div>

          <FiltroEstadoPacientes
            value={estadoSeleccionado}
            onChange={setEstadoSeleccionado}
          />
        </section>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pacientes encontrados: {pacientesFiltrados.length}
        </p>

        {pacientesFiltrados.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pacientesFiltrados.map((paciente) => (
              <PacienteCard key={paciente.id} paciente={paciente} />
            ))}
          </section>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            No se encontraron pacientes con esos criterios.
          </p>
        )}
      </div>
    </main>
  );
}
