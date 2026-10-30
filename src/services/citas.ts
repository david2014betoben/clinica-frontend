import { api } from "../lib/axios";
import type { RespuestaPaginada } from "../types/api";

export type EstadoCita = "programada" | "completada" | "cancelada";

export type EstadoHistorial =
  | "Todos"
  | "Programada"
  | "Completada"
  | "Cancelada";

export interface Cita {
  id: number;
  fecha: string;
  hora: string;
  estado: EstadoCita | null;
  id_paciente: number;
  id_medico: number;

  paciente: {
    nombre: string;
    ap_paterno: string;
    ap_materno: string | null;
  };

  medico: {
    nombre: string;
    ap_paterno: string;
    ap_materno: string | null;
  };
}

export type CrearCitaDTO = Omit<Cita, "id" | "estado" | "paciente" | "medico">;

export type NuevoEstadoCita = Exclude<EstadoCita, "programada">;

interface RespuestaListado {
  data: Cita[];
  total: number;
}

interface RespuestaCita {
  message: string;
  data: Cita;
}

interface ConsultaHistorial {
  pagina: number;
  estado: EstadoHistorial;
  signal?: AbortSignal;
}

export async function getAll(signal?: AbortSignal): Promise<Cita[]> {
  const respuesta = await api.get<RespuestaListado>("/citas", {
    signal,
  });

  return respuesta.data.data;
}

export async function getHistorial({
  pagina,
  estado,
  signal,
}: ConsultaHistorial): Promise<RespuestaPaginada<Cita>> {
  const respuesta = await api.get<RespuestaPaginada<Cita>>("/citas", {
    params: {
      pagina,
      limite: 10,
      ...(estado !== "Todos" ? { estado: estado.toLowerCase() } : {}),
    },
    signal,
  });

  return respuesta.data;
}

export async function create(data: CrearCitaDTO): Promise<Cita> {
  const respuesta = await api.post<RespuestaCita>("/citas/CREAR", data);

  return respuesta.data.data;
}

export async function updateEstado(
  id: number,
  estado: NuevoEstadoCita,
): Promise<void> {
  await api.patch(`/citas/${id}/estado`, { estado });
}
