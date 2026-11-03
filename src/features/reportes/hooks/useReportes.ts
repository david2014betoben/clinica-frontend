import { useEffect, useState } from "react";

import { api } from "../../../lib/axios";
import { extraerMensajeError } from "../../../lib/errorHandler";
import type { Cita } from "../../../services/citas";

interface EspecialidadAPI {
  especialidades: string;
  total_citas: number;
}

interface RespuestaEspecialidades {
  message: string;
  data: EspecialidadAPI[];
}

interface RespuestaCitas {
  data: Cita[];
  total: number;
}

interface DatoEspecialidad {
  especialidad: string;
  total: number;
}

interface DatoDia {
  fecha: string;
  etiqueta: string;
  total: number;
}

interface ResultadoReportes {
  intento: number;
  especialidades: DatoEspecialidad[];
  citasPorDia: DatoDia[];
  error: string | null;
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

function obtenerUltimosSieteDias(citas: Cita[]): DatoDia[] {
  const fechaBase = new Date(`${obtenerFechaBolivia()}T00:00:00.000Z`);

  const totalesPorFecha = new Map<string, number>();

  for (const cita of citas) {
    const fecha = cita.fecha.slice(0, 10);

    totalesPorFecha.set(fecha, (totalesPorFecha.get(fecha) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(fechaBase);

    fecha.setUTCDate(fecha.getUTCDate() - (6 - indice));

    const fechaTexto = fecha.toISOString().slice(0, 10);

    return {
      fecha: fechaTexto,
      etiqueta: new Intl.DateTimeFormat("es-BO", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(fecha),
      total: totalesPorFecha.get(fechaTexto) ?? 0,
    };
  });
}

export function useReportes() {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<ResultadoReportes | null>(null);

  const cargando = resultado?.intento !== intento;

  const error = cargando ? null : (resultado?.error ?? null);

  const especialidades = resultado?.especialidades ?? [];
  const citasPorDia = resultado?.citasPorDia ?? [];

  const hayCitasEnPeriodo = citasPorDia.some((dia) => dia.total > 0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarReportes() {
      try {
        const [respuestaEspecialidades, respuestaCitas] = await Promise.all([
          api.get<RespuestaEspecialidades>(
            "/citas/reports/citas_especialidad",
            { signal: controller.signal },
          ),

          api.get<RespuestaCitas>("/citas", {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        setResultado({
          intento,
          especialidades: respuestaEspecialidades.data.data.map((item) => ({
            especialidad: item.especialidades,
            total: item.total_citas,
          })),
          citasPorDia: obtenerUltimosSieteDias(respuestaCitas.data.data),
          error: null,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setResultado({
          intento,
          especialidades: [],
          citasPorDia: [],
          error: extraerMensajeError(err),
        });
      }
    }

    void cargarReportes();

    return () => controller.abort();
  }, [intento]);

  const recargar = () => {
    setIntento((actual) => actual + 1);
  };

  return {
    especialidades,
    citasPorDia,
    hayCitasEnPeriodo,
    cargando,
    error,
    intento,
    recargar,
  };
}
