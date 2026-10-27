// Formato solicitado en el enunciado.
export interface RespuestaPaginada<T> {
  data: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Formato que devuelve tu backend.
export interface RespuestaPaginadaAPI<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
