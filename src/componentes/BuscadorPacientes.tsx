interface BuscadorPacientesProps {
  value: string;
  onChange: (nuevoValor: string) => void;
}

export function BuscadorPacientes({ value, onChange }: BuscadorPacientesProps) {
  return (
    <label className="block">
      <span className="sr-only">Buscar pacientes</span>

      <input
        type="search"
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="Buscar por nombre, correo o especialidad..."
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  );
}
