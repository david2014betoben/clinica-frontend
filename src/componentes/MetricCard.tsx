import type { Metrica, Tendencia } from "../types";

interface MetricCardProps {
  metrica: Metrica;
}

const colorPorTendencia: Record<Tendencia, string> = {
  positiva: "text-emerald-400",
  negativa: "text-rose-400",
  neutra: "text-slate-300",
};

export function MetricCard({ metrica }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white">{metrica.titulo}</h2>

        <span aria-hidden="true">{metrica.icono}</span>
      </div>

      <p className="mt-2 text-2xl font-bold text-white">{metrica.valor}</p>

      <p className={`mt-1 text-sm ${colorPorTendencia[metrica.tendencia]}`}>
        {metrica.descripcion}
      </p>
    </article>
  );
}
