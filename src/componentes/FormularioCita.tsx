import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { citaSchema, type CitaFormData } from "../schemas/citaSchema";
import { useMedicos } from "../hooks/useMedicos";
import { usePacientes } from "../hooks/usePacientes";
import { extraerMensajeError } from "../lib/errorHandler";
import { useCitasStore } from "../stores/citasStore";

function obtenerFechaLocal(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerHoraLocal(): string {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
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

export function FormularioCita() {
  const {
    medicos,
    cargando: cargandoMedicos,
    error: errorMedicos,
  } = useMedicos();

  const {
    pacientes,
    cargando: cargandoPacientes,
    error: errorPacientes,
  } = usePacientes();

  const [citaConfirmada, setCitaConfirmada] = useState<CitaFormData | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
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

  const fechaSeleccionada = watch("fecha");
  const urgenciaSeleccionada = watch("urgencia");
  const motivoSeleccionado = watch("motivo") ?? "";

  const cargandoOpciones = cargandoMedicos || cargandoPacientes;
  const errorOpciones = errorPacientes ?? errorMedicos;
  const agregarCita = useCitasStore((state) => state.agregarCita);

  async function onSubmit(datos: CitaFormData) {
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

      const pacienteNombre = [
        paciente.nombre,
        paciente.ap_paterno,
        paciente.ap_materno,
      ]
        .filter(Boolean)
        .join(" ");

      setCitaConfirmada({
        ...datos,
        pacienteNombre,
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
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            ✓
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Confirmación
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              ¡Cita agendada con éxito!
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              La cita se guardó correctamente en el sistema.
            </p>
          </div>
        </div>

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

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Información temporal: el motivo y la urgencia no se guardaron.
          </p>

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
        <p
          role="alert"
          className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
        >
          No se pudieron cargar las opciones: {errorOpciones}. Recarga para
          reintentar.
        </p>
      )}

      {!cargandoOpciones &&
        !errorOpciones &&
        (pacientes.length === 0 || medicos.length === 0) && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          >
            Debe existir al menos un paciente y un médico para agendar.
          </p>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <fieldset disabled={isSubmitting} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="pacienteId" className={clasesLabel}>
                Paciente registrado <span className="text-rose-500">*</span>
              </label>

              <select
                id="pacienteId"
                disabled={cargandoPacientes || isSubmitting}
                aria-invalid={Boolean(errors.pacienteId)}
                aria-describedby={
                  errors.pacienteId ? "error-paciente" : undefined
                }
                {...register("pacienteId")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.pacienteId),
                )}`}
              >
                <option value="">
                  {cargandoPacientes
                    ? "Cargando pacientes..."
                    : "Selecciona un paciente"}
                </option>

                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {[paciente.nombre, paciente.ap_paterno, paciente.ap_materno]
                      .filter(Boolean)
                      .join(" ")}{" "}
                    — #{paciente.id}
                  </option>
                ))}
              </select>

              {errors.pacienteId && (
                <p
                  id="error-paciente"
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

              <select
                id="medicoId"
                disabled={cargandoMedicos || isSubmitting}
                aria-invalid={Boolean(errors.medicoId)}
                aria-describedby={errors.medicoId ? "error-medico" : undefined}
                {...register("medicoId")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.medicoId),
                )}`}
              >
                <option value="">
                  {cargandoMedicos
                    ? "Cargando médicos..."
                    : "Selecciona un médico"}
                </option>

                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nombre} — {medico.especialidad}
                  </option>
                ))}
              </select>

              {errors.medicoId && (
                <p
                  id="error-medico"
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
                {...register("fecha")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.fecha),
                )}`}
              />

              {errors.fecha && (
                <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
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
                {...register("hora")}
                className={`${clasesControl} ${clasesValidacion(
                  Boolean(errors.hora),
                )}`}
              />

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Selecciona minutos 00 o 30.
              </p>

              {errors.hora && (
                <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                  {errors.hora.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              El motivo y la urgencia se muestran en la confirmación, pero
              todavía no se guardan en el sistema.
            </p>

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
              {...register("motivo")}
              className={`${clasesControl} resize-y ${clasesValidacion(
                Boolean(errors.motivo),
              )}`}
            />

            {errors.motivo && (
              <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
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
              <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
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
            {isSubmitting && (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}

            {isSubmitting ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </form>
    </section>
  );
}
