import { useCallback, useEffect, useRef, useState } from "react";

import { useCitasStore } from "../../../stores/citasStore";
import { useFiltrosStore } from "../../../stores/filtrosStore";
import { extraerMensajeError } from "../../../lib/errorHandler";

interface OpcionesUseCitas {
  cargaInicial?: boolean;
}

export function useCitas({ cargaInicial = true }: OpcionesUseCitas = {}) {
  const citas = useCitasStore((state) => state.citas);
  const citaSeleccionada = useCitasStore((state) => state.citaSeleccionada);
  const cargando = useCitasStore((state) => state.cargando);

  const cargarStore = useCitasStore((state) => state.cargar);
  const cargarPorPaciente = useCitasStore((state) => state.cargarPorPaciente);
  const seleccionar = useCitasStore((state) => state.seleccionar);
  const actualizarEstado = useCitasStore((state) => state.actualizarEstado);
  const agregarCita = useCitasStore((state) => state.agregarCita);

  const estadoFiltro = useFiltrosStore((state) => state.estadoCitaFiltro);
  const setEstadoFiltro = useFiltrosStore((state) => state.setEstadoCita);

  const [error, setError] = useState<string | null>(null);

  const montado = useRef(false);
  const ultimaCarga = useRef(0);

  const cargar = useCallback(async (): Promise<void> => {
    const numeroCarga = ++ultimaCarga.current;

    if (montado.current) {
      setError(null);
    }

    try {
      await cargarStore();
    } catch (err: unknown) {
      const mensaje = extraerMensajeError(err);

      if (montado.current && numeroCarga === ultimaCarga.current) {
        setError(mensaje);
      }
    }
  }, [cargarStore]);

  useEffect(() => {
    montado.current = true;

    if (cargaInicial) {
      void cargar();
    }

    return () => {
      montado.current = false;
      ultimaCarga.current += 1;
    };
  }, [cargaInicial, cargar]);

  return {
    citas,
    citaSeleccionada,
    cargando,
    error,

    cargar,
    cargarPorPaciente,
    seleccionar,
    actualizarEstado,
    agregarCita,

    estadoFiltro,
    setEstadoFiltro,
  };
}
