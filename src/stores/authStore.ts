import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UsuarioSesion } from "../types/auth";

interface AuthState {
  token: string | null;
  usuario: UsuarioSesion | null;
  isAuthenticated: boolean;

  login: (token: string, usuario: UsuarioSesion) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      login: (token, usuario) => {
        set({
          token,
          usuario,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
