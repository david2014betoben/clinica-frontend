import type { PacienteAPI } from "./paciente-api";
import type { Cita } from "../services/citas";

export type { CrearPacienteDTO, ActualizarPacienteDTO } from "./paciente-api";

export type ResumenPaciente = Pick<
  PacienteAPI,
  "id" | "nombre" | "ap_paterno" | "ap_materno" | "email"
>;

export type CrearCitaDTO = Omit<Cita, "id" | "estado" | "paciente" | "medico">;

export type ActualizarEstadoCitaDTO = Pick<Cita, "estado">;
