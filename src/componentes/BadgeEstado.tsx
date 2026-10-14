import type { EstadoPaciente } from "../types/paciente";

interface BadgeEstadoProps {
  estado: EstadoPaciente;
}

const estilosPorEstado: Record<
  EstadoPaciente,
  { texto: string; estilos: string; punto: string }
> = {
  activo: {
    texto: "Activo",
    estilos:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    punto: "bg-emerald-500",
  },
  en_espera: {
    texto: "En espera",
    estilos:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    punto: "bg-amber-500",
  },
  inactivo: {
    texto: "Inactivo",
    estilos:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    punto: "bg-slate-400",
  },
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const configuracion = estilosPorEstado[estado];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${configuracion.estilos}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${configuracion.punto}`}
      />
      {configuracion.texto}
    </span>
  );
}
