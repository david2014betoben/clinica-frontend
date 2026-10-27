import { useApi } from "../hooks/useApi";
import type { Cita } from "../services/citas";

interface RespuestaCitas {
  data: Cita[];
  total: number;
}

interface Props {
  pacienteId: number;
}

export function CitasDelPaciente({ pacienteId }: Props) {
  const { data, cargando, error, recargar } = useApi<RespuestaCitas>("/citas");

  const citas =
    data?.data.filter((cita) => cita.id_paciente === pacienteId) ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold text-slate-950 dark:text-white">
        Citas del paciente
      </h2>

      {cargando ? (
        <p
          role="status"
          className="mt-3 text-sm text-slate-500 dark:text-slate-400"
        >
          Cargando citas...
        </p>
      ) : error ? (
        <div role="alert" className="mt-3">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            No se pudieron cargar las citas.
          </p>

          <button
            type="button"
            onClick={recargar}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {citas.length} cita(s) registrada(s)
        </p>
      )}
    </section>
  );
}
