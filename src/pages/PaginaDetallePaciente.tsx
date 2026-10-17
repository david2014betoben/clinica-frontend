import { useNavigate, useParams } from "react-router-dom";
import { pacientesIniciales } from "../data/pacientes";
import type { EstadoPaciente } from "../types/paciente";
import { PaginaNotFound } from "./PaginaNotFound";

const estilosEstado: Record<
  EstadoPaciente,
  { texto: string; clases: string; punto: string }
> = {
  activo: {
    texto: "Activo",
    clases:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    punto: "bg-emerald-500",
  },
  en_espera: {
    texto: "En espera",
    clases:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    punto: "bg-amber-500",
  },
  inactivo: {
    texto: "Inactivo",
    clases:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    punto: "bg-slate-400",
  },
};

export function PaginaDetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const paciente = pacientesIniciales.find((paciente) => paciente.id === id);

  if (!paciente) {
    return <PaginaNotFound />;
  }

  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
  const iniciales = `${paciente.nombre.charAt(0)}${paciente.apellido.charAt(0)}`;
  const estado = estilosEstado[paciente.estado];

  return (
    <main className="min-h-[75vh] w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Ruta de navegación"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <span>Pacientes</span>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Detalle del paciente
            </span>
          </nav>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">←</span>
            Volver
          </button>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-indigo-400/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-2xl font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              {iniciales}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {nombreCompleto}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${estado.clases}`}
                >
                  <span className={`size-1.5 rounded-full ${estado.punto}`} />
                  {estado.texto}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Paciente registrado
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  ID: {paciente.id}
                </span>

                <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {paciente.especialidadAsignada}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Datos de contacto
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Información de contacto registrada para este paciente.
              </p>
            </div>

            <dl className="space-y-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Correo electrónico
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-200">
                  {paciente.email}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Teléfono
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                  {paciente.telefono}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Información del paciente
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Especialidad y fecha de la última cita registrada.
              </p>
            </div>

            <dl className="space-y-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Especialidad asignada
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {paciente.especialidadAsignada}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Última cita
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {paciente.ultimaCita}
                </dd>
              </div>
            </dl>
          </article>
        </section>
      </div>
    </main>
  );
}
