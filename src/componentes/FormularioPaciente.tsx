import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { create } from "../services/pacientes";
import { extraerMensajeError } from "../lib/errorHandler";
import type { PacienteAPI } from "../types/paciente-api";

const schema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre"),
  ap_paterno: z.string().trim().min(1, "Ingresa el apellido paterno"),
  ap_materno: z.string().trim(),
  email: z.union([z.string().trim().email("Correo inválido"), z.literal("")]),
  telefono: z.union([
    z
      .string()
      .trim()
      .regex(/^\+?[0-9]{1,20}$/, "Teléfono inválido"),
    z.literal(""),
  ]),
  fecha_nacimiento: z
    .string()
    .min(1, "Ingresa la fecha de nacimiento")
    .refine((valor) => {
      const fecha = new Date(`${valor}T00:00:00`);
      return !Number.isNaN(fecha.getTime()) && fecha <= new Date();
    }, "La fecha no es válida o es futura"),
});

type DatosFormulario = z.infer<typeof schema>;

interface Props {
  onCreado: (paciente: PacienteAPI) => void;
  onCerrar: () => void;
}

const campos: {
  nombre: keyof DatosFormulario;
  etiqueta: string;
  tipo: string;
}[] = [
  { nombre: "nombre", etiqueta: "Nombre", tipo: "text" },
  { nombre: "ap_paterno", etiqueta: "Apellido paterno", tipo: "text" },
  { nombre: "ap_materno", etiqueta: "Apellido materno", tipo: "text" },
  { nombre: "email", etiqueta: "Correo electrónico", tipo: "email" },
  { nombre: "telefono", etiqueta: "Teléfono", tipo: "tel" },
  {
    nombre: "fecha_nacimiento",
    etiqueta: "Fecha de nacimiento",
    tipo: "date",
  },
];

export function FormularioPaciente({ onCreado, onCerrar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      ap_paterno: "",
      ap_materno: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
    },
  });

  const guardar = async (datos: DatosFormulario) => {
    try {
      const paciente = await create({
        nombre: datos.nombre,
        ap_paterno: datos.ap_paterno,
        fecha_nacimiento: datos.fecha_nacimiento,
        ...(datos.ap_materno ? { ap_materno: datos.ap_materno } : {}),
        ...(datos.email ? { email: datos.email } : {}),
        ...(datos.telefono ? { telefono: datos.telefono } : {}),
      });

      onCreado(paciente);
      toast.success("Paciente registrado");
      reset();
      onCerrar();
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-nuevo-paciente"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <h2
          id="titulo-nuevo-paciente"
          className="text-xl font-bold text-slate-950 dark:text-white"
        >
          Agregar paciente
        </h2>

        <form
          onSubmit={handleSubmit(guardar)}
          className="mt-5 space-y-5"
          noValidate
        >
          <fieldset
            disabled={isSubmitting}
            className="grid gap-4 disabled:opacity-60 sm:grid-cols-2"
          >
            {campos.map((campo, indice) => (
              <label
                key={campo.nombre}
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {campo.etiqueta}

                <input
                  {...register(campo.nombre)}
                  type={campo.tipo}
                  autoFocus={indice === 0}
                  aria-invalid={Boolean(errors[campo.nombre])}
                  aria-describedby={
                    errors[campo.nombre] ? `error-${campo.nombre}` : undefined
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />

                {errors[campo.nombre] && (
                  <span
                    id={`error-${campo.nombre}`}
                    role="alert"
                    className="mt-1 block text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors[campo.nombre]?.message}
                  </span>
                )}
              </label>
            ))}
          </fieldset>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCerrar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar paciente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
