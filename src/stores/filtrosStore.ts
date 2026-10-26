import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { EstadoCita } from "../services/citas";

interface FiltrosState {
  queryPacientes: string;
  especialidadFiltro: string;
  estadoCitaFiltro: EstadoCita | "Todos";

  setQueryPacientes: (query: string) => void;
  setEspecialidad: (especialidad: string) => void;
  setEstadoCita: (estado: EstadoCita | "Todos") => void;
  resetFiltros: () => void;
}

export const useFiltrosStore = create<FiltrosState>()(
  devtools(
    (set) => ({
      queryPacientes: "",
      especialidadFiltro: "",
      estadoCitaFiltro: "Todos",

      setQueryPacientes: (query) =>
        set({ queryPacientes: query }, false, "filtros/setQueryPacientes"),

      setEspecialidad: (especialidad) =>
        set(
          { especialidadFiltro: especialidad },
          false,
          "filtros/setEspecialidad",
        ),

      setEstadoCita: (estado) =>
        set({ estadoCitaFiltro: estado }, false, "filtros/setEstadoCita"),

      resetFiltros: () =>
        set(
          {
            queryPacientes: "",
            especialidadFiltro: "",
            estadoCitaFiltro: "Todos",
          },
          false,
          "filtros/resetFiltros",
        ),
    }),
    { name: "FiltrosStore" },
  ),
);
