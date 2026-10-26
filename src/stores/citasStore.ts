import { create } from "zustand";
import { devtools } from "zustand/middleware";

import * as citasService from "../services/citas";

import type { Cita, CrearCitaDTO, NuevoEstadoCita } from "../services/citas";

interface CitasState {
  citas: Cita[];
  citaSeleccionada: Cita | null;
  cargando: boolean;

  cargar: () => Promise<void>;
  cargarPorPaciente: (id: number) => Promise<void>;
  seleccionar: (id: number) => void;
  actualizarEstado: (id: number, estado: NuevoEstadoCita) => Promise<void>;
  agregarCita: (datos: CrearCitaDTO) => Promise<void>;
}

export const useCitasStore = create<CitasState>()(
  devtools(
    (set, get) => ({
      citas: [],
      citaSeleccionada: null,
      cargando: false,

      cargar: async () => {
        set({ cargando: true }, false, "citas/cargarInicio");

        try {
          const citas = await citasService.getAll();

          set(
            {
              citas,
              citaSeleccionada: null,
              cargando: false,
            },
            false,
            "citas/cargarExito",
          );
        } catch (err: unknown) {
          set({ cargando: false }, false, "citas/cargarError");

          throw err;
        }
      },

      cargarPorPaciente: async (id) => {
        set({ cargando: true }, false, "citas/cargarPorPacienteInicio");

        try {
          const todasLasCitas = await citasService.getAll();

          const citasDelPaciente = todasLasCitas.filter(
            (cita) => cita.id_paciente === id,
          );

          set(
            {
              citas: citasDelPaciente,
              citaSeleccionada: null,
              cargando: false,
            },
            false,
            "citas/cargarPorPacienteExito",
          );
        } catch (err: unknown) {
          set({ cargando: false }, false, "citas/cargarPorPacienteError");

          throw err;
        }
      },

      seleccionar: (id) => {
        const cita = get().citas.find((item) => item.id === id);

        set({ citaSeleccionada: cita ?? null }, false, "citas/seleccionar");
      },

      actualizarEstado: async (id, estado) => {
        await citasService.updateEstado(id, estado);

        set(
          (state) => ({
            citas: state.citas.map((cita) =>
              cita.id === id ? { ...cita, estado } : cita,
            ),

            citaSeleccionada:
              state.citaSeleccionada?.id === id
                ? { ...state.citaSeleccionada, estado }
                : state.citaSeleccionada,
          }),
          false,
          "citas/actualizarEstado",
        );
      },

      agregarCita: async (datos) => {
        await citasService.create(datos);

        // La respuesta de creación puede no incluir paciente y médico.
        // Recargamos para obtener las citas con sus relaciones completas.
        try {
          const citas = await citasService.getAll();

          set(
            {
              citas,
              citaSeleccionada: null,
            },
            false,
            "citas/agregarCita",
          );
        } catch {
          // La cita ya se guardó. La lista se actualizará al cargarla.
          set(
            { citas: [], citaSeleccionada: null },
            false,
            "citas/agregarCitaListaPendiente",
          );
        }
      },
    }),
    { name: "CitasStore" },
  ),
);
