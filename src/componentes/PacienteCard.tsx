import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { EstadoPaciente, Paciente } from "../types/paciente";
import { BadgeEstado } from "./BadgeEstado";

interface PacienteCardProps {
  paciente: Paciente;
  onCambiarEstado: (id: string, estado: EstadoPaciente) => void;
  onEliminar: (id: string) => void;
}

export function PacienteCard({
  paciente,
  onCambiarEstado,
  onEliminar,
}: PacienteCardProps) {
  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;

  const handleEstadoChange = (evento: ChangeEvent<HTMLSelectElement>) => {
    onCambiarEstado(paciente.id, evento.target.value as EstadoPaciente);
  };

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex min-w-0 flex-col items-start gap-3">
        <div className="min-w-0 w-full">
          <h2 className="break-words text-lg font-semibold text-slate-900 dark:text-white">
            {nombreCompleto}
          </h2>

          <p className="mt-1 break-words text-sm text-indigo-600 dark:text-indigo-400">
            {paciente.especialidadAsignada}
          </p>
        </div>

        <BadgeEstado estado={paciente.estado} />
      </div>

      <div className="min-w-0 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <p className="min-w-0">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Correo:
          </span>
          <span className="mt-1 block break-all">{paciente.email}</span>
        </p>

        <p className="min-w-0 break-words">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Teléfono:
          </span>{" "}
          {paciente.telefono}
        </p>

        <p className="min-w-0 break-words">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Última cita:
          </span>{" "}
          {paciente.ultimaCita}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Cambiar estado:
          </span>

          <select
            value={paciente.estado}
            onChange={handleEstadoChange}
            className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="activo">Activo</option>
            <option value="en_espera">En espera</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => onEliminar(paciente.id)}
          className="self-end rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          Eliminar
        </button>
      </div>

      <Link
        to={`/pacientes/${paciente.id}`}
        className="mt-4 inline-flex font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Ver detalle →
      </Link>
    </article>
  );
}
