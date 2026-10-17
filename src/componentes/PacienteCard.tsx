import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { EstadoPaciente, Paciente } from "../types/paciente";

interface PacienteCardProps {
  paciente: Paciente;
  onCambiarEstado: (id: string, estado: EstadoPaciente) => void;
  onEliminar: (id: string) => void;
}

const estilosEstado: Record<
  EstadoPaciente,
  { texto: string; clases: string; punto: string }
> = {
  activo: {
    texto: "Activo",
    clases:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    punto: "bg-emerald-500",
  },
  en_espera: {
    texto: "En espera",
    clases:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    punto: "bg-amber-500",
  },
  inactivo: {
    texto: "Inactivo",
    clases:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    punto: "bg-slate-400",
  },
};

export function PacienteCard({
  paciente,
  onCambiarEstado,
  onEliminar,
}: PacienteCardProps) {
  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
  const iniciales = `${paciente.nombre.charAt(0)}${paciente.apellido.charAt(0)}`;
  const estado = estilosEstado[paciente.estado];

  const handleEstadoChange = (evento: ChangeEvent<HTMLSelectElement>) => {
    onCambiarEstado(paciente.id, evento.target.value as EstadoPaciente);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-sm font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            {iniciales}
          </div>

          <div className="min-w-0">
            <h2
              title={nombreCompleto}
              className="truncate text-base font-semibold text-slate-900 transition group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300"
            >
              {nombreCompleto}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {paciente.email}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${estado.clases}`}
        >
          <span className={`size-1.5 rounded-full ${estado.punto}`} />
          {estado.texto}
        </span>
      </div>

      <div className="mt-4">
        <span className="inline-block max-w-full truncate rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
          {paciente.especialidadAsignada}
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
        <div>
          <p className="text-xs font-medium text-slate-400">Teléfono</p>
          <p className="mt-0.5 break-words text-slate-700 dark:text-slate-200">
            {paciente.telefono}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">Última cita</p>
          <p className="mt-0.5 text-slate-700 dark:text-slate-200">
            {paciente.ultimaCita}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
        <label className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Cambiar estado
          </span>

          <select
            value={paciente.estado}
            onChange={handleEstadoChange}
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="activo">Activo</option>
            <option value="en_espera">En espera</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>

        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/pacientes/${paciente.id}`}
            className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-center text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            Ver detalle <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            onClick={() => onEliminar(paciente.id)}
            aria-label={`Eliminar a ${nombreCompleto}`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
