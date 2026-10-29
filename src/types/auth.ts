export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string | null;
  foto?: string | null;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}
