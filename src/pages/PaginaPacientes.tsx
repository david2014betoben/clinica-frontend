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

const claseInput =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

const claseLabel =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";

export function PaginaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<EstadoFiltro>("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState<DatosNuevoPaciente>(
    crearFormularioInicial,
  );
  const [errorFormulario, setErrorFormulario] = useState("");

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

  const eliminarPaciente = (id: string) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar este paciente?",
    );

    if (!confirmado) return;

    setPacientes((anteriores) =>
      anteriores.filter((paciente) => paciente.id !== id),
    );
  };

  const actualizarCampo = <K extends keyof DatosNuevoPaciente>(
    campo: K,
    valor: DatosNuevoPaciente[K],
  ) => {
    setNuevoPaciente((actual) => ({ ...actual, [campo]: valor }));
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setErrorFormulario("");
  };

  const agregarPaciente = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!nuevoPaciente.nombre.trim() || !nuevoPaciente.email.trim()) {
      setErrorFormulario("Nombre y correo electrónico son obligatorios.");
      return;
    }

    const pacienteCreado: Paciente = {
      ...nuevoPaciente,
      nombre: nuevoPaciente.nombre.trim(),
      apellido: nuevoPaciente.apellido.trim(),
      email: nuevoPaciente.email.trim(),
      id: `pac-${Date.now()}`,
    };

    setPacientes((anteriores) => [...anteriores, pacienteCreado]);
    setNuevoPaciente(crearFormularioInicial());
    setErrorFormulario("");
    setMostrarFormulario(false);
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" || estadoSeleccionado !== "todos";

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] space-y-6">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                Pacientes
              </h1>

              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
                {pacientes.length}{" "}
                {pacientes.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Administra los datos de contacto, estado y especialidad de tus
              pacientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Agregar paciente
          </button>
        </header>

        <section
          aria-label="Filtros de pacientes"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <BuscadorPacientes value={busqueda} onChange={setBusqueda} />
              </div>

              <div className="w-full shrink-0 sm:w-56">
                <FiltroEstadoPacientes
                  value={estadoSeleccionado}
                  onChange={setEstadoSeleccionado}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 xl:justify-end xl:border-0 xl:pt-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {pacientesFiltrados.length}
                </span>{" "}
                de {pacientes.length} pacientes
              </p>

              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setEstadoSeleccionado("todos");
                }}
                disabled={!hayFiltrosActivos}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        {pacientesFiltrados.length > 0 ? (
          <section
            aria-label="Listado de pacientes"
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {pacientesFiltrados.map((paciente) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                onCambiarEstado={cambiarEstado}
                onEliminar={eliminarPaciente}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No se encontraron pacientes
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Cambia la búsqueda o el filtro de estado e inténtalo de nuevo.
            </p>
          </section>
        )}
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-paciente"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Nuevo registro
                </p>
                <h2
                  id="titulo-formulario-paciente"
                  className="mt-1 text-xl font-bold text-slate-950 dark:text-white"
                >
                  Agregar paciente
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                aria-label="Cerrar formulario"
                className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={agregarPaciente} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={claseLabel}>
                  Nombre
                  <input
                    required
                    value={nuevoPaciente.nombre}
                    onChange={(evento) =>
                      actualizarCampo("nombre", evento.target.value)
                    }
                    className={claseInput}
                    placeholder="Nombre"
                  />
                </label>

                <label className={claseLabel}>
                  Apellido
                  <input
                    required
                    value={nuevoPaciente.apellido}
                    onChange={(evento) =>
                      actualizarCampo("apellido", evento.target.value)
                    }
                    className={claseInput}
                    placeholder="Apellido"
                  />
                </label>
              </div>

              <label className={claseLabel}>
                Correo electrónico
                <input
                  required
                  type="email"
                  value={nuevoPaciente.email}
                  onChange={(evento) =>
                    actualizarCampo("email", evento.target.value)
                  }
                  className={claseInput}
                  placeholder="correo@ejemplo.com"
                />
              </label>

              <label className={claseLabel}>
                Teléfono
                <input
                  required
                  type="tel"
                  value={nuevoPaciente.telefono}
                  onChange={(evento) =>
                    actualizarCampo("telefono", evento.target.value)
                  }
                  className={claseInput}
                  placeholder="+591 ..."
                />
              </label>

              <label className={claseLabel}>
                Especialidad asignada
                <input
                  required
                  value={nuevoPaciente.especialidadAsignada}
                  onChange={(evento) =>
                    actualizarCampo("especialidadAsignada", evento.target.value)
                  }
                  className={claseInput}
                  placeholder="Especialidad"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={claseLabel}>
                  Última cita
                  <input
                    required
                    type="date"
                    value={nuevoPaciente.ultimaCita}
                    onChange={(evento) =>
                      actualizarCampo("ultimaCita", evento.target.value)
                    }
                    className={claseInput}
                  />
                </label>

                <label className={claseLabel}>
                  Estado
                  <select
                    value={nuevoPaciente.estado}
                    onChange={(evento) =>
                      actualizarCampo(
                        "estado",
                        evento.target.value as EstadoPaciente,
                      )
                    }
                    className={claseInput}
                  >
                    <option value="activo">Activo</option>
                    <option value="en_espera">En espera</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>
              </div>

              {errorFormulario && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
                >
                  {errorFormulario}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Guardar paciente
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
