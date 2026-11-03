import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getHistorial } from "../../../services/citas";
import type { Cita, EstadoHistorial } from "../../../services/citas";
import type { RespuestaPaginada } from "../../../types/api";
import { extraerMensajeError } from "../../../lib/errorHandler";

const estados: EstadoHistorial[] = [
  "Todos",
  "Programada",
  "Completada",
  "Cancelada",
];

function esEstadoHistorial(valor: string | null): valor is EstadoHistorial {
  return estados.some((estado) => estado === valor);
}

interface ResultadoCarga {
  clave: string;
  respuesta: RespuestaPaginada<Cita> | null;
  error: string | null;
}

export function useHistorialCitas() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);

  const paginaURL = Number(searchParams.get("pagina"));

  const pagina =
    Number.isSafeInteger(paginaURL) && paginaURL > 0 ? paginaURL : 1;

  const estadoURL = searchParams.get("estado");

  const estado: EstadoHistorial = esEstadoHistorial(estadoURL)
    ? estadoURL
    : "Todos";

  const clave = `${pagina}-${estado}-${intento}`;
  const cargando = resultado?.clave !== clave;

  const resultadoActual = resultado?.clave === clave ? resultado : null;

  const error = resultadoActual?.error ?? null;
  const respuesta = resultadoActual?.respuesta;

  const citas = respuesta?.data ?? [];
  const totalPaginas = respuesta?.totalPaginas ?? 1;
  const total = respuesta?.total ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const datos = await getHistorial({
          pagina,
          estado,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setResultado({
          clave,
          respuesta: datos,
          error: null,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setResultado({
          clave,
          respuesta: null,
          error: extraerMensajeError(err),
        });
      }
    }

    void cargar();

    return () => controller.abort();
  }, [pagina, estado, clave]);

  const cambiarEstado = (nuevoEstado: EstadoHistorial) => {
    setSearchParams({
      pagina: "1",
      estado: nuevoEstado,
    });
  };

  const seleccionarEstado = (valor: string) => {
    if (esEstadoHistorial(valor)) {
      cambiarEstado(valor);
    }
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (!Number.isSafeInteger(nuevaPagina) || nuevaPagina < 1) {
      return;
    }

    setSearchParams({
      pagina: String(nuevaPagina),
      estado,
    });
  };

  const recargar = () => {
    setIntento((actual) => actual + 1);
  };

  return {
    citas,
    cargando,
    error,
    pagina,
    totalPaginas,
    total,
    estado,
    estados,
    cambiarEstado,
    seleccionarEstado,
    cambiarPagina,
    recargar,
  };
}
