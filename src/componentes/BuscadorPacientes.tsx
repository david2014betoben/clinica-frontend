interface BuscadorPacientesProps {
  value: string;
  onChange: (nuevoValor: string) => void;
  buscando: boolean;
}

export function BuscadorPacientes({
  value,
  onChange,
  buscando,
}: BuscadorPacientesProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Buscar pacientes</span>

      <input
        type="search"
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="Buscar por nombre o apellido..."
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      {buscando && (
        <span
          role="status"
          aria-label="Buscando pacientes"
          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
        />
      )}
    </label>
  );
}
