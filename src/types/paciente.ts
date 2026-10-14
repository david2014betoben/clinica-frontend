export type EstadoPaciente = "activo" | "inactivo" | "en_espera";

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidadAsignada: string;
  ultimaCita: string;
  estado: EstadoPaciente;
}
