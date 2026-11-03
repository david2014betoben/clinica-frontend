import { useAuthStore } from "../../../stores/authStore";
import { login as loginService } from "../../../services/auth";
import { actualizarPerfil as actualizarPerfilService } from "../../../services/perfil";

import type { LoginFormData } from "../../../schemas/loginSchema";
import type { UsuarioSesion } from "../../../types/auth";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const usuario = useAuthStore((state) => state.usuario);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const guardarSesion = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const actualizarUsuario = useAuthStore((state) => state.actualizarUsuario);

  const iniciarSesion = async (datos: LoginFormData): Promise<void> => {
    const respuesta = await loginService(datos);

    guardarSesion(respuesta.token, respuesta.usuario);
  };

  const guardarPerfil = async (datos: FormData): Promise<UsuarioSesion> => {
    const actualizado = await actualizarPerfilService(datos);

    actualizarUsuario(actualizado);

    return actualizado;
  };

  return {
    token,
    usuario,
    isAuthenticated,
    iniciarSesion,
    logout,
    guardarPerfil,
  };
}
