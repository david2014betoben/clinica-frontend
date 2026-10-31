import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { citaSchema, type CitaFormData } from "../schemas/citaSchema";
import { useMedicos } from "../hooks/useMedicos";
import { usePacientes } from "../hooks/usePacientes";
import { extraerMensajeError } from "../lib/errorHandler";
import { useCitasStore } from "../stores/citasStore";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { Spinner } from "../shared/components/ui/Spinner";

function obtenerFechaLocal(): string {
  const hoy = new Date();

  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");
}

function obtenerHoraLocal(): string {
  const ahora = new Date();

  return [
    String(ahora.getHours()).padStart(2, "0"),
    String(ahora.getMinutes()).padStart(2, "0"),
  ].join(":");
}

const urgencias: Array<{
  valor: CitaFormData["urgencia"];
  etiqueta: string;
  punto: string;
}> = [
  { valor: "baja", etiqueta: "Baja", punto: "bg-emerald-500" },
  { valor: "media", etiqueta: "Media", punto: "bg-amber-500" },
  { valor: "alta", etiqueta: "Alta", punto: "bg-orange-500" },
  { valor: "critica", etiqueta: "Crítica", punto: "bg-rose-500" },
];

const clasesControl =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

const clasesLabel =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

function clasesValidacion(conError: boolean): string {
  return conError
    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15 dark:border-slate-700";
}

function SkeletonSelector({ mensaje }: { mensaje: string }) {
  return (
    <div role="status" className="flex h-11 items-center">
      <span className="sr-only">{mensaje}</span>

      <div
        aria-hidden="true"
        className="h-11 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
      />
    </div>
  );
}

export function FormularioCita() {
  const {
    medicos,
    cargando: cargandoMedicos,
    error: errorMedicos,
    recargar: recargarMedicos,
  } = useMedicos();

  const {
    pacientes,
    cargando: cargandoPacientes,
    error: errorPacientes,
    recargar: recargarPacientes,
  } = usePacientes();

  const agregarCita = useCitasStore((state) => state.agregarCita);

  const [citaConfirmada, setCitaConfirmada] = useState<CitaFormData | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteId: "",
      pacienteNombre: "",
      medicoId: "",
      fecha: "",
      hora: "",
      motivo: "",
      urgencia: "media",
    },
  });

  const fechaSeleccionada = useWatch({
    control,
    name: "fecha",
  });

  const urgenciaSeleccionada = useWatch({
    control,
    name: "urgencia",
  });

  const motivoSeleccionado = useWatch({ control, name: "motivo" }) ?? "";

  const cargandoOpciones = cargandoMedicos || cargandoPacientes;
  const errorOpciones = errorPacientes ?? errorMedicos;

  const faltanOpciones =
    !cargandoOpciones &&
    !errorOpciones &&
    (pacientes.length === 0 || medicos.length === 0);

  async function reintentarOpciones() {
    try {
      await Promise.all([recargarPacientes(), recargarMedicos()]);
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  }

  async function onSubmit(datos: CitaFormData) {
    if (cargandoOpciones || errorOpciones || faltanOpciones) return;

    const paciente = pacientes.find(
      (item) => item.id === Number(datos.pacienteId),
    );
    const medico = medicos.find((item) => item.id === datos.medicoId);

    if (!paciente || !medico) {
      toast.error("Selecciona un paciente y un médico válidos");
      return;
    }

    try {
      await agregarCita({
        id_paciente: paciente.id,
        id_medico: Number(medico.id),
        fecha: datos.fecha,
        hora: datos.hora,
      });

      setCitaConfirmada({
        ...datos,
        pacienteNombre: [
          paciente.nombre,
          paciente.ap_paterno,
          paciente.ap_materno,
        ]
          .filter(Boolean)
          .join(" "),
      });

      reset();
      toast.success("Cita registrada");
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  }

  function agendarOtraCita() {
    setCitaConfirmada(null);
    reset();
  }

  const medicoSeleccionado = medicos.find(
    (medico) => medico.id === citaConfirmada?.medicoId,
  );

  if (citaConfirmada) {
    const fechaFormateada = new Date(
      `${citaConfirmada.fecha}T00:00:00`,
    ).toLocaleDateString("es-BO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900 sm:p-7">
        <AlertaBanner
          tipo="exito"
          titulo="¡Cita agendada con éxito!"
          mensaje="La cita se guardó correctamente en el sistema."
        />

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Paciente
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {citaConfirmada.pacienteNombre}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Médico
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {medicoSeleccionado?.nombre ?? "Médico seleccionado"}
            </dd>

            {medicoSeleccionado?.especialidad && (
              <dd className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {medicoSeleccionado.especialidad}
              </dd>
            )}
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Fecha y hora
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {fechaFormateada} · {citaConfirmada.hora}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <AlertaBanner
            tipo="advertencia"
            mensaje="Información temporal: el motivo y la urgencia no se guardaron."
          />

          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">
                Urgencia
              </dt>
              <dd className="capitalize text-slate-600 dark:text-slate-400">
                {citaConfirmada.urgencia}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">
                Motivo
              </dt>
              <dd className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                {citaConfirmada.motivo}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Link
            to="/citas"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Ver citas
          </Link>

          <button
            type="button"
            onClick={agendarOtraCita}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Agendar otra cita
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="mb-6 border-b border-slate-100 pb-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
          Datos de la cita
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Los campos marcados son necesarios para agendar.
        </p>
      </div>

      {errorOpciones && (
        <div className="mb-5">
          <AlertaBanner
            tipo="error"
            titulo="No se pudieron cargar las opciones"
            mensaje={errorOpciones}
            accion={
              cargandoOpciones
                ? undefined
                : {
                    label: "Reintentar",
                    onClick: () => void reintentarOpciones(),
                  }
            }
          />
        </div>
      )}

      {faltanOpciones && (
        <div className="mb-5">
          <AlertaBanner
            tipo="advertencia"
            mensaje="Debe existir al menos un paciente y un médico para agendar."
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <fieldset disabled={isSubmitting} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="pacienteId" className={clasesLabel}>
                Paciente registrado <span className="text-rose-500">*</span>
              </label>

              {cargandoPacientes ? (
                <SkeletonSelector mensaje="Cargando pacientes..." />
              ) : (
                <select
                  id="pacienteId"
                  disabled={Boolean(errorPacientes) || isSubmitting}
                  aria-invalid={Boolean(errors.pacienteId)}
                  aria-describedby={
                    errors.pacienteId ? "error-paciente" : undefined
                  }
                  {...register("pacienteId")}
                  className={`${clasesControl} ${clasesValidacion(
                    Boolean(errors.pacienteId),
                  )}`}
                >
                  <option value="">Selecciona un paciente</option>

                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {[
                        paciente.nombre,
                        paciente.ap_paterno,
                        paciente.ap_materno,
                      ]
                        .filter(Boolean)
                        .join(" ")}{" "}
                      — #{paciente.id}
                    </option>
                  ))}
                </select>
              )}

              {errors.pacienteId && (
                <p
                  id="error-paciente"
                  role="alert"
                  className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
                >
                  {errors.pacienteId.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="medicoId" className={clasesLabel}>
                Médico especialista <span className="text-rose-500">*</span>
              </label>

              {cargandoMedicos ? (
                <SkeletonSelector mensaje="Cargando médicos..." />
              ) : (
                <select
                  id="medicoId"
                  disabled={Boolean(errorMedicos) || isSubmitting}
                  aria-invalid={Boolean(errors.medicoId)}
                  aria-describedby={
                    errors.medicoId ? "error-medico" : undefined
                  }
                  {...register("medicoId")}
                  className={`${clasesControl} ${clasesValidacion(
                    Boolean(errors.medicoId),
                  )}`}
                >
                  <option value="">Selecciona un médico</option>

                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.nombre} — {medico.especialidad}
                    </option>
                  ))}
                </select>
              )}

              {errors.medicoId && (
                <p
                  id="error-medico"
                  role="alert"
                  className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
                >
                  {errors.medicoId.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fecha" className={clasesLabel}>
                Fecha de la cita <span className="text-rose-500">*</span>
              </label>

              <input
                id="fecha"
                type="date"
                min={obtenerFechaLocal()}
                aria-invalid={Boolean(errors.fecha)}
                aria-describedby={errors.fecha ? "error-fecha" : undefined}
                {...register("fecha")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.fecha),
                )}`}
              />

              {errors.fecha && (
                <p
                  id="error-fecha"
                  role="alert"
                  className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
                >
                  {errors.fecha.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="hora" className={clasesLabel}>
                Hora de la cita <span className="text-rose-500">*</span>
              </label>

              <input
                id="hora"
                type="time"
                step={1800}
                min={
                  fechaSeleccionada === obtenerFechaLocal()
                    ? obtenerHoraLocal()
                    : undefined
                }
                aria-invalid={Boolean(errors.hora)}
                aria-describedby={
                  errors.hora ? "ayuda-hora error-hora" : "ayuda-hora"
                }
                {...register("hora")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.hora),
                )}`}
              />

              <p
                id="ayuda-hora"
                className="mt-1 text-xs text-slate-500 dark:text-slate-400"
              >
                Selecciona minutos 00 o 30.
              </p>

              {errors.hora && (
                <p
                  id="error-hora"
                  role="alert"
                  className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
                >
                  {errors.hora.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <AlertaBanner
                tipo="info"
                mensaje="El motivo y la urgencia se muestran en la confirmación, pero todavía no se guardan en el sistema."
              />
            </div>

            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="motivo" className={clasesLabel}>
                Motivo de la consulta <span className="text-rose-500">*</span>
              </label>

              <span className="shrink-0 text-xs text-slate-400">
                {motivoSeleccionado.length}/500
              </span>
            </div>

            <textarea
              id="motivo"
              rows={4}
              maxLength={500}
              placeholder="Describe brevemente el motivo de la cita..."
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={errors.motivo ? "error-motivo" : undefined}
              {...register("motivo")}
              className={`${clasesControl} resize-y ${clasesValidacion(
                Boolean(errors.motivo),
              )}`}
            />

            {errors.motivo && (
              <p
                id="error-motivo"
                role="alert"
                className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.motivo.message}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Nivel de urgencia <span className="text-rose-500">*</span>
            </legend>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {urgencias.map((opcion) => {
                const seleccionada = urgenciaSeleccionada === opcion.valor;

                return (
                  <label
                    key={opcion.valor}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-3 text-sm transition focus-within:ring-2 focus-within:ring-indigo-500 ${
                      seleccionada
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opcion.valor}
                      {...register("urgencia")}
                      className="sr-only"
                    />

                    <span
                      aria-hidden="true"
                      className={`size-2.5 shrink-0 rounded-full ${opcion.punto}`}
                    />

                    <span className="font-medium">{opcion.etiqueta}</span>
                  </label>
                );
              })}
            </div>

            {errors.urgencia && (
              <p
                role="alert"
                className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.urgencia.message}
              </p>
            )}
          </fieldset>
        </fieldset>

        <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              cargandoOpciones ||
              Boolean(errorOpciones) ||
              pacientes.length === 0 ||
              medicos.length === 0
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting && <Spinner mensaje="Agendando cita..." />}
            {isSubmitting ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </form>
    </section>
  );
}
