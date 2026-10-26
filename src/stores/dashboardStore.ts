import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";

type RespuestaListado =
  | {
      data: unknown[];
      total: number;
    }
  | unknown[];

interface TotalesDashboard {
  pacientes: number;
  medicos: number;
  programadas: number;
  completadas: number;
}

interface DashboardState {
  totales: TotalesDashboard | null;
  cargando: boolean;
  error: string | null;
  cargarMetricas: () => Promise<void>;
}

function obtenerTotal(respuesta: RespuestaListado): number {
  return Array.isArray(respuesta) ? respuesta.length : respuesta.total;
}

function obtenerFechaBolivia(): string {
  const partes = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const anio = partes.find((parte) => parte.type === "year")?.value;
  const mes = partes.find((parte) => parte.type === "month")?.value;
  const dia = partes.find((parte) => parte.type === "day")?.value;

  return `${anio}-${mes}-${dia}`;
}

let ultimaCarga = 0;

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      totales: null,
      cargando: true,
      error: null,

      cargarMetricas: async () => {
        const numeroCarga = ++ultimaCarga;

        set({ cargando: true, error: null }, false, "dashboard/cargarInicio");

        try {
          const hoy = obtenerFechaBolivia();

          const [pacientes, medicos, programadas, completadas] =
            await Promise.all([
              api.get<RespuestaListado>("/pacientes"),

              api.get<RespuestaListado>("/medicos"),

              api.get<RespuestaListado>("/citas", {
                params: {
                  estado: "programada",
                },
              }),

              api.get<RespuestaListado>("/citas", {
                params: {
                  estado: "completada",
                  fecha: hoy,
                },
              }),
            ]);

          if (numeroCarga !== ultimaCarga) return;

          set(
            {
              totales: {
                pacientes: obtenerTotal(pacientes.data),
                medicos: obtenerTotal(medicos.data),
                programadas: obtenerTotal(programadas.data),
                completadas: obtenerTotal(completadas.data),
              },
              cargando: false,
              error: null,
            },
            false,
            "dashboard/cargarExito",
          );
        } catch (err: unknown) {
          if (numeroCarga !== ultimaCarga) return;

          set(
            {
              cargando: false,
              error: extraerMensajeError(err),
            },
            false,
            "dashboard/cargarError",
          );

          throw err;
        }
      },
    }),
    { name: "DashboardStore" },
  ),
);
