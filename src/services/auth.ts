import { api } from "../lib/axios";

import type { LoginFormData } from "../schemas/loginSchema";
import type { LoginResponse } from "../types/auth";

export async function login(datos: LoginFormData): Promise<LoginResponse> {
  const respuesta = await api.post<LoginResponse>("/auth/login", datos);

  return respuesta.data;
}
