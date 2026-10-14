import type { EstadoPaciente } from "../types/paciente";

type EstadoFiltro = EstadoPaciente | "todos";

interface FiltroEstadoPacientesProps {
  value: EstadoFiltro;
  onChange: (nuevoEstado: EstadoFiltro) => void;
}

export function FiltroEstadoPacientes({
  value,
  onChange,
}: FiltroEstadoPacientesProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
      <span>Estado:</span>

      <select
        value={value}
        onChange={(evento) => onChange(evento.target.value as EstadoFiltro)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="todos">Todos</option>
        <option value="activo">Activo</option>
        <option value="en_espera">En espera</option>
        <option value="inactivo">Inactivo</option>
      </select>
    </label>
  );
}
