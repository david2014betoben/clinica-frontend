import { useEffect, useState } from "react";
import axios from "axios";

import { usePacientesStore } from "../../../stores/pacientesStore";
import { extraerMensajeError } from "../../../lib/errorHandler";

interface EstadoConsulta {
  clave: string;
  error: string | null;
  noEncontrado: boolean;
}

export function useDetallePaciente(id: string | undefined) {
  const paciente = usePacientesStore((state) => state.pacienteSeleccionado);
  const cargarDetalle = usePacientesStore((state) => state.cargarDetalle);

  const [intento, setIntento] = useState(0);
  const [consulta, setConsulta] = useState<EstadoConsulta | null>(null);

  const idValido =
    id !== undefined &&
    /^[1-9]\d*$/.test(id) &&
    Number.isSafeInteger(Number(id));

  const clave = `${id}-${intento}`;
  const cargando = idValido && consulta?.clave !== clave;

  const consultaActual = consulta?.clave === clave ? consulta : null;

  const error = consultaActual?.error ?? null;
  const noEncontrado = consultaActual?.noEncontrado ?? false;

  useEffect(() => {
    if (!idValido || id === undefined) return;

    const controller = new AbortController();

    async function cargarPaciente() {
      try {
        await cargarDetalle(Number(id), controller.signal);

        if (controller.signal.aborted) return;

        setConsulta({
          clave,
          error: null,
          noEncontrado: false,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        const mensaje = extraerMensajeError(err);
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined;

        setConsulta({
          clave,
          noEncontrado: status === 404,
          error:
            status === 403
              ? "Tu usuario no tiene permiso para consultar el detalle. Esta operación requiere el rol RECEPCIONISTA."
              : mensaje,
        });
      }
    }

    void cargarPaciente();

    return () => controller.abort();
  }, [id, idValido, clave, cargarDetalle]);

  const pacienteActual =
    idValido && paciente?.id === Number(id) ? paciente : null;

  const reintentar = () => {
    setIntento((actual) => actual + 1);
  };

  return {
    paciente: pacienteActual,
    cargando,
    error,
    idValido,
    noEncontrado,
    clave,
    reintentar,
  };
}
