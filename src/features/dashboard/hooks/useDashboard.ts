import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import { useDashboardStore } from "../../../stores/dashboardStore";
import { extraerMensajeError } from "../../../lib/errorHandler";

export function useDashboard() {
  const totales = useDashboardStore((state) => state.totales);
  const cargando = useDashboardStore((state) => state.cargando);
  const error = useDashboardStore((state) => state.error);
  const cargarMetricas = useDashboardStore((state) => state.cargarMetricas);

  const actualizarMetricas = useCallback(async () => {
    try {
      await cargarMetricas();
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  }, [cargarMetricas]);

  useEffect(() => {
    void actualizarMetricas();
  }, [actualizarMetricas]);

  return {
    totales,
    cargando,
    error,
    actualizarMetricas,
  };
}
