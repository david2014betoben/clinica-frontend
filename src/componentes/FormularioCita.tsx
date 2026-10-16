import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { citaSchema, type CitaFormData } from "../schemas/citaSchema";
import { useMedicos } from "../hooks/useMedicos";

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

export function FormularioCita() {
  const { medicos, cargando } = useMedicos();
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
      pacienteNombre: "",
      medicoId: "",
      fecha: "",
      hora: "",
      motivo: "",
      urgencia: "media",
    },
  });

  const fechaSeleccionada = watch("fecha");

  async function onSubmit(datos: CitaFormData) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1500);
    });

    setCitaConfirmada(datos);
  }

  function agendarOtraCita() {
    setCitaConfirmada(null);
    reset();
  }

  const medicoSeleccionado = medicos.find(
    (medico) => medico.id === citaConfirmada?.medicoId,
  );

  if (citaConfirmada) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-white p-6 text-slate-900 shadow dark:border-green-900 dark:bg-slate-900 dark:text-slate-100">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
          ¡Cita agendada!
        </h2>

        <dl className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">
              Paciente
            </dt>
            <dd>{citaConfirmada.pacienteNombre}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">
              Médico
            </dt>
            <dd>{medicoSeleccionado?.nombre ?? "Médico seleccionado"}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">
              Fecha y hora
            </dt>
            <dd>
              {citaConfirmada.fecha} a las {citaConfirmada.hora}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">
              Motivo
            </dt>
            <dd>{citaConfirmada.motivo}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">
              Urgencia
            </dt>
            <dd className="capitalize">{citaConfirmada.urgencia}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={agendarOtraCita}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Agendar otra cita
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Nueva cita
      </h1>

      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Completa los datos para agendar una cita médica.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="pacienteNombre"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Nombre del paciente
          </label>

          <input
            id="pacienteNombre"
            {...register("pacienteNombre")}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.pacienteNombre
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />

          {errors.pacienteNombre && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.pacienteNombre.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="medicoId"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Médico
          </label>

          <select
            id="medicoId"
            {...register("medicoId")}
            disabled={cargando}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.medicoId
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {cargando ? (
              <option value="" disabled>
                Cargando médicos...
              </option>
            ) : (
              <>
                <option value="">Selecciona un médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nombre} — {medico.especialidad}
                  </option>
                ))}
              </>
            )}
          </select>

          {errors.medicoId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.medicoId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fecha"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Fecha
          </label>

          <input
            id="fecha"
            type="date"
            min={obtenerFechaLocal()}
            {...register("fecha")}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.fecha
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />

          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.fecha.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="hora"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Hora
          </label>

          <input
            id="hora"
            type="time"
            min={
              fechaSeleccionada === obtenerFechaLocal()
                ? obtenerHoraLocal()
                : undefined
            }
            {...register("hora")}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.hora
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />

          {errors.hora && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.hora.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="motivo"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Motivo de la cita
          </label>

          <textarea
            id="motivo"
            rows={4}
            {...register("motivo")}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.motivo
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />

          {errors.motivo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.motivo.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="urgencia"
            className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
          >
            Urgencia
          </label>

          <select
            id="urgencia"
            {...register("urgencia")}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${
              errors.urgencia
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          {errors.urgencia && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.urgencia.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Agendando..." : "Agendar cita"}
        </button>
      </form>
    </section>
  );
}
