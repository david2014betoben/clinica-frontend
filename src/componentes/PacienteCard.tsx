import type { Paciente } from "../types/paciente";
import { BadgeEstado } from "./BadgeEstado";

interface PacienteCardProps {
  paciente: Paciente;
}

export function PacienteCard({ paciente }: PacienteCardProps) {
  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {nombreCompleto}
          </h2>

          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
            {paciente.especialidadAsignada}
          </p>
        </div>

        <BadgeEstado estado={paciente.estado} />
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Correo:
          </span>{" "}
          {paciente.email}
        </p>

        <p>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Teléfono:
          </span>{" "}
          {paciente.telefono}
        </p>

        <p>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Última cita:
          </span>{" "}
          {paciente.ultimaCita}
        </p>
      </div>
    </article>
  );
}
