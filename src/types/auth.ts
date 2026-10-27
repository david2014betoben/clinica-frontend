export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}
