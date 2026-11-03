import { Link, useParams } from "react-router-dom";

import { CitasDelPaciente } from "../componentes/CitasDelPaciente";
import { useDetallePaciente } from "../features/pacientes/hooks/useDetallePaciente";
import { PaginaNotFound } from "./PaginaNotFound";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { ErrorBoundary } from "../shared/components/ui/ErrorBoundary";

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin información";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "Sin información";

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(valor);
}

const clasePanel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6";

function SkeletonDetallePaciente() {
  const bloque = "animate-pulse rounded bg-slate-200 dark:bg-slate-700";

  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Cargando paciente...</span>

      <div aria-hidden="true" className="space-y-6">
        <div className={`${clasePanel} sm:p-7`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className={`${bloque} size-20 shrink-0 rounded-2xl`} />

            <div className="flex-1 space-y-3">
              <div className={`${bloque} h-8 w-3/4 max-w-96`} />
              <div className={`${bloque} h-4 w-36`} />
              <div className={`${bloque} h-6 w-20`} />
            </div>
          </div>
        </div>

        <div className={`${clasePanel} space-y-4`}>
          <div className={`${bloque} h-6 w-48`} />

          {Array.from({ length: 3 }, (_, indice) => (
            <div key={indice} className={`${bloque} h-16 w-full`} />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, indice) => (
            <div key={indice} className={`${clasePanel} space-y-5`}>
              <div className={`${bloque} h-6 w-48`} />
              <div className={`${bloque} h-4 w-full`} />

              {Array.from({ length: 3 }, (_, campo) => (
                <div key={campo} className="space-y-2">
                  <div className={`${bloque} h-3 w-28`} />
                  <div className={`${bloque} h-5 w-2/3`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaginaDetallePaciente() {
  const { id } = useParams();

  const {
    paciente: pacienteActual,
    cargando,
    error,
    idValido,
    noEncontrado,
    clave,
    reintentar,
  } = useDetallePaciente(id);

  if (!idValido || noEncontrado) {
    return <PaginaNotFound />;
  }

  const nombreCompleto = pacienteActual
    ? [
        pacienteActual.nombre,
        pacienteActual.ap_paterno,
        pacienteActual.ap_materno,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const iniciales = pacienteActual
    ? (
        pacienteActual.nombre.charAt(0) + pacienteActual.ap_paterno.charAt(0)
      ).toUpperCase()
    : "";

  return (
    <div className="min-h-[75vh] w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Ruta de navegación"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <Link
              to="/pacientes"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              Pacientes
            </Link>

            <span aria-hidden="true">›</span>

            <span
              aria-current="page"
              className="font-medium text-indigo-600 dark:text-indigo-400"
            >
              Detalle del paciente
            </span>
          </nav>

          <Link
            to="/pacientes"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">←</span>
            Volver
          </Link>
        </div>

        {cargando ? (
          <SkeletonDetallePaciente />
        ) : error ? (
          <AlertaBanner
            tipo="error"
            titulo="No se pudo cargar el paciente"
            mensaje={error}
            accion={{
              label: "Reintentar",
              onClick: reintentar,
            }}
          />
        ) : pacienteActual ? (
          <>
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

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-slate-400"
                      />
                      Estado sin información
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Paciente registrado
                  </p>

                  <div className="mt-3">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      ID: {pacienteActual.id}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <ErrorBoundary
              key={`citas-${clave}`}
              fallback={
                <AlertaBanner
                  tipo="error"
                  titulo="No se pudieron mostrar las citas del paciente"
                  mensaje="Los datos personales siguen disponibles. Puedes reintentar para volver a cargar esta sección."
                  accion={{
                    label: "Reintentar",
                    onClick: reintentar,
                  }}
                />
              }
            >
              <CitasDelPaciente pacienteId={pacienteActual.id} />
            </ErrorBoundary>

            <section className="grid gap-5 lg:grid-cols-2">
              <article className={clasePanel}>
                <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Datos de contacto
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Información registrada para este paciente.
                  </p>
                </div>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Correo electrónico
                    </dt>
                    <dd className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-200">
                      {pacienteActual.email || "Sin información"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Teléfono
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                      {pacienteActual.telefono || "Sin información"}
                    </dd>
                  </div>
                </dl>
              </article>

              <article className={clasePanel}>
                <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Información del paciente
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Datos personales y de atención.
                  </p>
                </div>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Fecha de nacimiento
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatearFecha(pacienteActual.fecha_nacimiento)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Especialidad asignada
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      Sin información
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Última cita
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      Sin información
                    </dd>
                  </div>
                </dl>
              </article>
            </section>
          </>
        ) : (
          <AlertaBanner
            tipo="advertencia"
            titulo="El paciente no está disponible"
            mensaje="No se recibieron los datos del paciente solicitado."
            accion={{
              label: "Reintentar",
              onClick: reintentar,
            }}
          />
        )}
      </div>
    </div>
  );
}
