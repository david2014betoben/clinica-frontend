import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";

export interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
}

interface MedicoAPI {
  id: number;
  nombre: string;
  ap_paterno: string;
  ap_materno: string | null;
  especialidad: {
    nombre: string;
  } | null;
}

type RespuestaMedicos =
  | MedicoAPI[]
  | {
      data: MedicoAPI[];
      totalPages?: number;
    };

interface MedicosState {
  medicos: Medico[];
  cargando: boolean;
  error: string | null;
  cargar: () => Promise<void>;
}

let ultimaCarga = 0;

export const useMedicosStore = create<MedicosState>()(
  devtools(
    (set) => ({
      medicos: [],
      cargando: true,
      error: null,

      cargar: async () => {
        const numeroCarga = ++ultimaCarga;

        set({ cargando: true, error: null }, false, "medicos/cargarInicio");

        try {
          const registros: MedicoAPI[] = [];
          let pagina = 1;
          let totalPaginas = 1;

          do {
            const respuesta = await api.get<RespuestaMedicos>("/medicos", {
              params: {
                page: pagina,
                limit: 100,
              },
            });

            const contenido = respuesta.data;

            if (Array.isArray(contenido)) {
              registros.push(...contenido);
              totalPaginas = 1;
            } else {
              registros.push(...contenido.data);
              totalPaginas = contenido.totalPages ?? 1;
            }

            pagina += 1;
          } while (pagina <= totalPaginas);

          if (numeroCarga !== ultimaCarga) return;

          const medicos = registros.map((medico) => ({
            id: String(medico.id),

            nombre: [medico.nombre, medico.ap_paterno, medico.ap_materno]
              .filter(Boolean)
              .join(" "),

            especialidad: medico.especialidad?.nombre ?? "Sin especialidad",
          }));

          set(
            {
              medicos,
              cargando: false,
              error: null,
            },
            false,
            "medicos/cargarExito",
          );
        } catch (err: unknown) {
          if (numeroCarga !== ultimaCarga) return;

          set(
            {
              cargando: false,
              error: extraerMensajeError(err),
            },
            false,
            "medicos/cargarError",
          );
        }
      },
    }),
    { name: "MedicosStore" },
  ),
);
