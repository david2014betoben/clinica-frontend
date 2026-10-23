import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import type { PacienteAPI } from "../types/paciente-api";
import { getById } from "../services/pacientes";
import { extraerMensajeError } from "../lib/errorHandler";
import { PaginaNotFound } from "./PaginaNotFound";

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin información";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin información";
  }

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(valor);
}

export function PaginaDetallePaciente() {
  const { id } = useParams();

  const [paciente, setPaciente] = useState<PacienteAPI | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const idValido =
    id !== undefined &&
    /^[1-9]\d*$/.test(id) &&
    Number.isSafeInteger(Number(id));

  const cargarPaciente = useCallback(
    async (signal?: AbortSignal) => {
      if (!idValido || id === undefined) {
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);
      setNoEncontrado(false);
      setPaciente(null);

      try {
        const datos = await getById(Number(id), signal);

        if (!signal?.aborted) {
          setPaciente(datos);
        }
      } catch (err: unknown) {
        if (signal?.aborted) return;

        const mensaje = extraerMensajeError(err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setNoEncontrado(true);
            return;
          }

          if (err.response?.status === 403) {
            const mensajePermisos =
              "Tu usuario no tiene permiso para consultar el detalle. Esta operación requiere el rol RECEPCIONISTA.";

            setError(mensajePermisos);
            toast.error(mensajePermisos);
            return;
          }
        }

        setError(mensaje);
        toast.error(mensaje);
      } finally {
        if (!signal?.aborted) {
          setCargando(false);
        }
      }
    },
    [id, idValido],
  );

  useEffect(() => {
    const controller = new AbortController();

    void cargarPaciente(controller.signal);

    return () => controller.abort();
  }, [cargarPaciente]);

  if (!idValido || noEncontrado) {
    return <PaginaNotFound />;
  }

  const nombreCompleto = paciente
    ? [paciente.nombre, paciente.ap_paterno, paciente.ap_materno]
        .filter(Boolean)
        .join(" ")
    : "";

  const iniciales = paciente
    ? `${paciente.nombre.charAt(0)}${paciente.ap_paterno.charAt(0)}`.toUpperCase()
    : "";

  return (
    <main className="min-h-[75vh] w-full bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
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
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              aria-hidden="true"
              className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
            />
            Cargando paciente...
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-slate-900"
          >
            <h1 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
              No se pudo cargar el paciente
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void cargarPaciente()}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </section>
        ) : paciente ? (
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

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      ID: {paciente.id}
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
                    Información registrada para este paciente.
                  </p>
                </div>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Correo electrónico
                    </dt>
                    <dd className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-200">
                      {paciente.email || "Sin información"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Teléfono
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                      {paciente.telefono || "Sin información"}
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
                    Datos personales y de atención.
                  </p>
                </div>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Fecha de nacimiento
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatearFecha(paciente.fecha_nacimiento)}
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
        ) : null}
      </div>
    </main>
  );
}
