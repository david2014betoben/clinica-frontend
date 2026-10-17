import { useNavigate } from "react-router-dom";
import { FormularioCita } from "../componentes/FormularioCita";

export function PaginaNuevaCita() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              Agenda médica
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Nueva cita
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Completa los datos del paciente y selecciona el médico, la fecha y
              la hora de atención.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Cancelar
          </button>
        </header>

        <FormularioCita />
      </div>
    </main>
  );
}
