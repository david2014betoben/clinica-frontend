import { api } from "../lib/axios";
import type { UsuarioSesion } from "../types/auth";

interface RespuestaPerfil {
  message: string;
  usuario: UsuarioSesion;
}

export async function actualizarPerfil(
  datos: FormData,
): Promise<UsuarioSesion> {
  const respuesta = await api.put<RespuestaPerfil>("/auth/perfil", datos);

  return respuesta.data.usuario;
}
