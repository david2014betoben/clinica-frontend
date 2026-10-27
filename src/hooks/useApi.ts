import { useCallback, useEffect, useState } from "react";

import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";

interface ResultadoApi<T> {
  data: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

export function useApi<T>(url: string): ResultadoApi<T> {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const recargar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      setCargando(true);
      setError(null);
      setData(null);

      try {
        const respuesta = await api.get<T>(url, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setData(respuesta.data);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(extraerMensajeError(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      controller.abort();
    };
  }, [url, intento]);

  return { data, cargando, error, recargar };
}
