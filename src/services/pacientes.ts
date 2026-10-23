import { api } from "../lib/axios";
import type {
  CrearPacienteDTO,
  ActualizarPacienteDTO,
  RespuestaPaciente,
  RespuestaEliminarPaciente,
  PacienteAPI,
} from "../types/paciente-api";

export async function create(data: CrearPacienteDTO) {
  const respuesta = await api.post<RespuestaPaciente>("/pacientes", data);

  return respuesta.data.data;
}

export async function update(id: number, data: ActualizarPacienteDTO) {
  const respuesta = await api.put<RespuestaPaciente>(`/pacientes/${id}`, data);

  return respuesta.data.data;
}

export async function remove(id: number): Promise<void> {
  await api.delete<RespuestaEliminarPaciente>(`/pacientes/${id}`);
}

export async function getById(
  id: number,
  signal?: AbortSignal,
): Promise<PacienteAPI> {
  const respuesta = await api.get<PacienteAPI | { data: PacienteAPI }>(
    `/pacientes/${id}`,
    { signal },
  );

  return "data" in respuesta.data ? respuesta.data.data : respuesta.data;
}
