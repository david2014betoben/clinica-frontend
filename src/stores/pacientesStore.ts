import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";
import * as pacientesService from "../services/pacientes";

import type {
  PacienteAPI,
  CrearPacienteDTO,
  ActualizarPacienteDTO,
} from "../types/paciente-api";

interface RespuestaPacientes {
  data: PacienteAPI[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PacientesState {
  pacientes: PacienteAPI[];
  cargando: boolean;
  error: string | null;

  total: number;
  pagina: number;
  totalPaginas: number;

  opcionesPacientes: PacienteAPI[];
  cargandoOpciones: boolean;
  errorOpciones: string | null;

  pacienteSeleccionado: PacienteAPI | null;

  cargar: (query?: string, pagina?: number) => Promise<void>;
  cargarOpciones: () => Promise<void>;
  cargarDetalle: (id: number, signal?: AbortSignal) => Promise<void>;

  crear: (datos: CrearPacienteDTO) => Promise<PacienteAPI>;

  actualizar: (
    id: number,
    datos: ActualizarPacienteDTO,
  ) => Promise<PacienteAPI>;

  eliminar: (id: number) => Promise<void>;
}

const LIMITE_POR_PAGINA = 10;

let ultimaCarga = 0;
let ultimaCargaOpciones = 0;
let ultimaCargaDetalle = 0;

export const usePacientesStore = create<PacientesState>()(
  devtools(
    (set, get) => ({
      pacientes: [],
      cargando: false,
      error: null,

      total: 0,
      pagina: 1,
      totalPaginas: 1,

      opcionesPacientes: [],
      cargandoOpciones: false,
      errorOpciones: null,

      pacienteSeleccionado: null,

      cargar: async (query, pagina = get().pagina) => {
        const numeroCarga = ++ultimaCarga;

        set({ cargando: true, error: null }, false, "pacientes/cargarInicio");

        try {
          const respuesta = await api.get<RespuestaPacientes>("/pacientes", {
            params: {
              page: pagina,
              limit: LIMITE_POR_PAGINA,
              ...(query?.trim() ? { query: query.trim() } : {}),
            },
          });

          if (numeroCarga !== ultimaCarga) return;

          set(
            {
              pacientes: respuesta.data.data,
              total: respuesta.data.total,
              pagina: respuesta.data.page,
              totalPaginas: Math.max(1, respuesta.data.totalPages),
              cargando: false,
              error: null,
            },
            false,
            "pacientes/cargarExito",
          );
        } catch (err: unknown) {
          if (numeroCarga !== ultimaCarga) return;

          set(
            {
              cargando: false,
              error: extraerMensajeError(err),
            },
            false,
            "pacientes/cargarError",
          );
        }
      },

      cargarOpciones: async () => {
        const numeroCarga = ++ultimaCargaOpciones;

        set(
          {
            cargandoOpciones: true,
            errorOpciones: null,
          },
          false,
          "pacientes/cargarOpcionesInicio",
        );

        try {
          const registros: PacienteAPI[] = [];
          let pagina = 1;
          let totalPaginas = 1;

          do {
            const respuesta = await api.get<RespuestaPacientes>("/pacientes", {
              params: {
                page: pagina,
                limit: 100,
              },
            });

            registros.push(...respuesta.data.data);
            totalPaginas = respuesta.data.totalPages;
            pagina += 1;
          } while (pagina <= totalPaginas);

          if (numeroCarga !== ultimaCargaOpciones) return;

          set(
            {
              opcionesPacientes: registros,
              cargandoOpciones: false,
              errorOpciones: null,
            },
            false,
            "pacientes/cargarOpcionesExito",
          );
        } catch (err: unknown) {
          if (numeroCarga !== ultimaCargaOpciones) return;

          set(
            {
              cargandoOpciones: false,
              errorOpciones: extraerMensajeError(err),
            },
            false,
            "pacientes/cargarOpcionesError",
          );
        }
      },

      cargarDetalle: async (id, signal) => {
        const numeroCarga = ++ultimaCargaDetalle;

        set(
          { pacienteSeleccionado: null },
          false,
          "pacientes/cargarDetalleInicio",
        );

        try {
          const paciente = await pacientesService.getById(id, signal);

          if (signal?.aborted || numeroCarga !== ultimaCargaDetalle) {
            return;
          }

          set(
            { pacienteSeleccionado: paciente },
            false,
            "pacientes/cargarDetalleExito",
          );
        } catch (err: unknown) {
          if (signal?.aborted || numeroCarga !== ultimaCargaDetalle) {
            return;
          }

          throw err;
        }
      },

      crear: async (datos) => {
        const paciente = await pacientesService.create(datos);

        set(
          (state) => {
            const nuevoTotal = state.total + 1;

            return {
              pacientes: [paciente, ...state.pacientes],
              total: nuevoTotal,
              totalPaginas: Math.max(
                1,
                Math.ceil(nuevoTotal / LIMITE_POR_PAGINA),
              ),
            };
          },
          false,
          "pacientes/crearExito",
        );

        return paciente;
      },

      actualizar: async (id, datos) => {
        const pacienteActualizado = await pacientesService.update(id, datos);

        set(
          (state) => ({
            pacientes: state.pacientes.map((paciente) =>
              paciente.id === id ? pacienteActualizado : paciente,
            ),

            opcionesPacientes: state.opcionesPacientes.map((paciente) =>
              paciente.id === id ? pacienteActualizado : paciente,
            ),

            pacienteSeleccionado:
              state.pacienteSeleccionado?.id === id
                ? pacienteActualizado
                : state.pacienteSeleccionado,
          }),
          false,
          "pacientes/actualizarExito",
        );

        return pacienteActualizado;
      },

      eliminar: async (id) => {
        await pacientesService.remove(id);

        set(
          (state) => {
            const nuevoTotal = Math.max(0, state.total - 1);

            return {
              pacientes: state.pacientes.filter(
                (paciente) => paciente.id !== id,
              ),

              opcionesPacientes: state.opcionesPacientes.filter(
                (paciente) => paciente.id !== id,
              ),

              pacienteSeleccionado:
                state.pacienteSeleccionado?.id === id
                  ? null
                  : state.pacienteSeleccionado,

              total: nuevoTotal,

              totalPaginas: Math.max(
                1,
                Math.ceil(nuevoTotal / LIMITE_POR_PAGINA),
              ),
            };
          },
          false,
          "pacientes/eliminarExito",
        );
      },
    }),
    { name: "PacientesStore" },
  ),
);
