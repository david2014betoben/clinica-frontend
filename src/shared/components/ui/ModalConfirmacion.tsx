import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";

import { Spinner } from "./Spinner";

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
  const id = useId();
  const dialogoRef = useRef<HTMLElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    cancelarRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;

      if (elementoAnterior instanceof HTMLElement) {
        elementoAnterior.focus();
      }
    };
  }, []);

  const manejarTeclado = (evento: KeyboardEvent<HTMLElement>) => {
    if (evento.key === "Escape" && !procesando) {
      evento.preventDefault();
      onCancelar();
      return;
    }

    if (evento.key !== "Tab") return;

    const botones = dialogoRef.current?.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    );

    const primero = botones?.[0];
    const ultimo = botones?.[botones.length - 1];

    if (!primero || !ultimo) {
      evento.preventDefault();
      dialogoRef.current?.focus();
      return;
    }

    if (
      evento.shiftKey &&
      (document.activeElement === primero ||
        document.activeElement === dialogoRef.current)
    ) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <section
        ref={dialogoRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-busy={procesando}
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-mensaje`}
        onKeyDown={manejarTeclado}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900"
      >
        <h2
          id={`${id}-titulo`}
          className="text-xl font-bold text-slate-950 dark:text-white"
        >
          {titulo}
        </h2>

        <p
          id={`${id}-mensaje`}
          className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
        >
          {mensaje}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelarRef}
            type="button"
            disabled={procesando}
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={procesando}
            onClick={onConfirmar}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {procesando && <Spinner mensaje={textoProcesando} />}
            {procesando ? textoProcesando : textoConfirmar}
          </button>
        </div>
      </section>
    </div>
  );
}
