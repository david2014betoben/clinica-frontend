type TipoAlerta = "info" | "exito" | "advertencia" | "error";

interface AlertaBannerProps {
  tipo: TipoAlerta;
  mensaje: string;
  titulo?: string;
  accion?: {
    label: string;
    onClick: () => void;
  };
}

const estilos: Record<TipoAlerta, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
  exito:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  advertencia:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  error:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
};

export function AlertaBanner({
  tipo,
  mensaje,
  titulo,
  accion,
}: AlertaBannerProps) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-xl border p-5 ${estilos[tipo]}`}
    >
      {titulo && <p className="font-semibold">{titulo}</p>}

      <p className={`${titulo ? "mt-1 " : ""}text-sm leading-6`}>{mensaje}</p>

      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-3 rounded-lg border border-current px-4 py-2 text-sm font-semibold transition hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current"
        >
          {accion.label}
        </button>
      )}
    </div>
  );
}
