export type Tendencia = "positiva" | "negativa" | "neutra";

export interface Metrica {
  id: string;
  titulo: string;
  valor: number | string;
  descripcion: string;
  tendencia: Tendencia;
  icono: string;
}
