interface Props {
  titulo: string;
  mensaje: string;
  procesando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
  textoProcesando?: string;
}

export function ModalConfirmacion({
  titulo,
  mensaje,
  procesando,
  onConfirmar,
  onCancelar,
  textoConfirmar = "Eliminar",
  textoProcesando = "Eliminando...",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-mensaje"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <h2
          id="confirmacion-titulo"
          className="text-xl font-bold text-slate-950 dark:text-white"
        >
          {titulo}
        </h2>

        <p
          id="confirmacion-mensaje"
          className="mt-3 text-sm text-slate-600 dark:text-slate-300"
        >
          {mensaje}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={procesando}
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={procesando}
            onClick={onConfirmar}
            className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {procesando ? textoProcesando : textoConfirmar}
          </button>
        </div>
      </section>
    </div>
  );
}
