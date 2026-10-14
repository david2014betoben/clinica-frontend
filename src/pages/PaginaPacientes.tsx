// Problemas encontrados en el codigo generado por la ia:
// 1. Los pacientes de ejemplo estan definidos en el mismo archivo que la pagina, lo que dificulta separar los datos de la interfaz.
// 2. Los cambios se guardan solo en el estado local de react; al recargar la pagina, se pierden los pacientes agregados, eliminados o modificados.
// 3. PaginaPacientes concentra varias tareas: busqueda, filtros, formulario, registro y eliminacion de pacientes. Podrian separarse en componentes o funciones.

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { EstadoPaciente, Paciente } from "../types/paciente";
import { BuscadorPacientes } from "../componentes/BuscadorPacientes";
import { FiltroEstadoPacientes } from "../componentes/FiltroEstadoPacientes";
import { PacienteCard } from "../componentes/PacienteCard";
import { pacientesIniciales } from "../data/pacientes";

type EstadoFiltro = EstadoPaciente | "todos";
type DatosNuevoPaciente = Omit<Paciente, "id">;

function obtenerFechaLocal(): string {
  const fecha = new Date();
  const diferenciaZonaHoraria = fecha.getTimezoneOffset() * 60_000;

  return new Date(fecha.getTime() - diferenciaZonaHoraria)
    .toISOString()
    .slice(0, 10);
}

function crearFormularioInicial(): DatosNuevoPaciente {
  return {
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    especialidadAsignada: "",
    ultimaCita: obtenerFechaLocal(),
    estado: "activo",
  };
}

export function PaginaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<EstadoFiltro>("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState<DatosNuevoPaciente>(
    crearFormularioInicial,
  );

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

  const cambiarEstado = (id: string, nuevoEstado: EstadoPaciente) => {
    setPacientes((anteriores) =>
      anteriores.map((paciente) =>
        paciente.id === id ? { ...paciente, estado: nuevoEstado } : paciente,
      ),
    );
  };

  const agregarPaciente = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const pacienteCreado: Paciente = {
      ...nuevoPaciente,
      id: `pac-${Date.now()}`,
    };

    setPacientes((anteriores) => [pacienteCreado, ...anteriores]);
    setNuevoPaciente(crearFormularioInicial());
    setMostrarFormulario(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Pacientes
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Consulta, busca y administra los pacientes registrados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            + Agregar paciente
          </button>
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
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                onCambiarEstado={cambiarEstado}
              />
            ))}
          </section>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            No se encontraron pacientes con esos criterios.
          </p>
        )}

        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Agregar paciente
                </h2>

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  aria-label="Cerrar formulario"
                  className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={agregarPaciente} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nombre
                    <input
                      required
                      value={nuevoPaciente.nombre}
                      onChange={(evento) =>
                        setNuevoPaciente({
                          ...nuevoPaciente,
                          nombre: evento.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Apellido
                    <input
                      required
                      value={nuevoPaciente.apellido}
                      onChange={(evento) =>
                        setNuevoPaciente({
                          ...nuevoPaciente,
                          apellido: evento.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Correo electrónico
                  <input
                    required
                    type="email"
                    value={nuevoPaciente.email}
                    onChange={(evento) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        email: evento.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                  <input
                    required
                    type="tel"
                    value={nuevoPaciente.telefono}
                    onChange={(evento) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        telefono: evento.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Especialidad asignada
                  <input
                    required
                    value={nuevoPaciente.especialidadAsignada}
                    onChange={(evento) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        especialidadAsignada: evento.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Última cita
                    <input
                      required
                      type="date"
                      value={nuevoPaciente.ultimaCita}
                      onChange={(evento) =>
                        setNuevoPaciente({
                          ...nuevoPaciente,
                          ultimaCita: evento.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Estado
                    <select
                      value={nuevoPaciente.estado}
                      onChange={(evento) =>
                        setNuevoPaciente({
                          ...nuevoPaciente,
                          estado: evento.target.value as EstadoPaciente,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="activo">Activo</option>
                      <option value="en_espera">En espera</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Guardar paciente
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
