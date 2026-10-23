export interface PacienteAPI {
  id: number;
  nombre: string;
  ap_paterno: string;
  ap_materno: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
}

export type CrearPacienteDTO = Omit<
  PacienteAPI,
  "id" | "ap_materno" | "email" | "telefono" | "fecha_nacimiento"
> & {
  ap_materno?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento: string;
};

export type ActualizarPacienteDTO = Partial<CrearPacienteDTO>;

export interface RespuestaPaciente {
  message: string;
  data: PacienteAPI;
}

export interface RespuestaEliminarPaciente {
  message: string;
}
