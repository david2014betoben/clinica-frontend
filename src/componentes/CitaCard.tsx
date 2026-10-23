import { startTransition, useOptimistic, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  updateEstado,
  type Cita,
  type NuevoEstadoCita,
} from "../services/citas";
import { extraerMensajeError } from "../lib/errorHandler";

interface Props {
  cita: Cita;
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(fecha));
}

export function CitaCard({ cita }: Props) {
  const [estadoReal, setEstadoReal] = useState(cita.estado);
  const [guardando, setGuardando] = useState(false);
  const bloqueo = useRef(false);

  const [estadoOptimista, mostrarEstadoOptimista] = useOptimistic(
    estadoReal,
    (_actual, nuevo: NuevoEstadoCita) => nuevo,
  );

  const cambiarEstado = (nuevoEstado: NuevoEstadoCita) => {
    if (bloqueo.current || nuevoEstado === estadoReal) return;

    bloqueo.current = true;
    setGuardando(true);

    startTransition(async () => {
      mostrarEstadoOptimista(nuevoEstado);

      try {
        await updateEstado(cita.id, nuevoEstado);

        startTransition(() => {
          setEstadoReal(nuevoEstado);
        });

        toast.success("Estado de cita actualizado");
      } catch (err: unknown) {
        toast.error(`Cambio revertido: ${extraerMensajeError(err)}`);
      } finally {
        bloqueo.current = false;
        setGuardando(false);
      }
    });
  };

  const nombrePaciente = [
    cita.paciente.nombre,
    cita.paciente.ap_paterno,
    cita.paciente.ap_materno,
  ]
    .filter(Boolean)
    .join(" ");

  const nombreMedico = [
    cita.medico.nombre,
    cita.medico.ap_paterno,
    cita.medico.ap_materno,
  ]
    .filter(Boolean)
    .join(" ");

  const colorEstado =
    estadoOptimista === "completada"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : estadoOptimista === "cancelada"
        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
        : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";

  return (
    <article
      aria-busy={guardando}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {nombrePaciente}
        </h2>

        <span
          aria-live="polite"
          className={`rounded-full px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estadoOptimista ?? "Sin estado"}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Médico</dt>
          <dd>{nombreMedico}</dd>
        </div>

        <div>
          <dt className="text-slate-500 dark:text-slate-400">Fecha y hora</dt>
          <dd>
            {formatearFecha(cita.fecha)} · {cita.hora.slice(11, 16)}
          </dd>
        </div>
      </dl>

      <label className="mt-5 block border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
        Cambiar estado
        <select
          value={estadoOptimista ?? ""}
          disabled={guardando}
          onChange={(evento) => {
            const valor = evento.target.value;

            if (valor === "completada" || valor === "cancelada") {
              cambiarEstado(valor);
            }
          }}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="" disabled>
            Sin estado
          </option>
          <option value="programada" disabled>
            Programada
          </option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </label>

      {guardando && (
        <p role="status" className="mt-2 text-xs text-slate-500">
          Guardando cambio...
        </p>
      )}
    </article>
  );
}
