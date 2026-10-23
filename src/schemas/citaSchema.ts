import { z } from "zod";

function obtenerFechaLocal(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function esFechaCalendarioValida(fecha: string): boolean {
  const partes = fecha.split("-");

  if (partes.length !== 3) return false;

  const [anio, mes, dia] = partes.map(Number);
  const fechaIngresada = new Date(anio, mes - 1, dia);

  return (
    fechaIngresada.getFullYear() === anio &&
    fechaIngresada.getMonth() === mes - 1 &&
    fechaIngresada.getDate() === dia
  );
}

export const citaSchema = z
  .object({
    pacienteId: z.string().regex(/^[1-9]\d*$/, "Debes seleccionar un paciente"),

    pacienteNombre: z.string(),

    medicoId: z.string().min(1, "Debes seleccionar un médico"),

    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD")
      .refine(esFechaCalendarioValida, "Ingresa una fecha válida")
      .refine(
        (fecha) => fecha >= obtenerFechaLocal(),
        "La fecha no puede ser pasada",
      ),

    hora: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):(00|30)$/,
        "Selecciona una hora en intervalos de 30 minutos",
      ),

    motivo: z
      .string()
      .trim()
      .min(10, "El motivo debe tener al menos 10 caracteres")
      .max(500, "El motivo no puede superar los 500 caracteres"),

    urgencia: z.enum(["baja", "media", "alta", "critica"]),
  })
  .superRefine(({ fecha, hora }, ctx) => {
    const formatoHoraValido = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (fecha === obtenerFechaLocal() && formatoHoraValido.test(hora)) {
      const ahora = new Date();
      const horaActual =
        `${String(ahora.getHours()).padStart(2, "0")}:` +
        `${String(ahora.getMinutes()).padStart(2, "0")}`;

      if (hora < horaActual) {
        ctx.addIssue({
          code: "custom",
          path: ["hora"],
          message: "La hora no puede ser pasada",
        });
      }
    }
  });

export type CitaFormData = z.infer<typeof citaSchema>;
