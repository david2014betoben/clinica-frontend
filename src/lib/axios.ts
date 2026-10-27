import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  // El login no necesita enviar un token anterior.
  const esLogin = config.url?.split("?")[0] === "/auth/login";

  if (token && !esLogin) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url?.split("?")[0];

      // Si el login devuelve 401, el formulario muestra
      // "Credenciales inválidas" sin cerrar otra sesión.
      const esLogin = url === "/auth/login";

      if (status === 401 && !esLogin) {
        useAuthStore.getState().logout();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);
