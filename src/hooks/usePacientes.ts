import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";
import type { PacienteAPI } from "../types/paciente-api";

interface RespuestaPacientes {
  data: PacienteAPI[];
  totalPages: number;
}

export function usePacientes() {
  const [pacientes, setPacientes] = useState<PacienteAPI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const registros: PacienteAPI[] = [];
        let pagina = 1;
        let totalPaginas = 1;

        do {
          const respuesta = await api.get<RespuestaPacientes>("/pacientes", {
            params: { page: pagina, limit: 100 },
            signal: controller.signal,
          });

          registros.push(...respuesta.data.data);
          totalPaginas = respuesta.data.totalPages;
          pagina += 1;
        } while (pagina <= totalPaginas);

        if (!controller.signal.aborted) {
          setPacientes(registros);
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

    return () => controller.abort();
  }, []);

  return { pacientes, cargando, error };
}
