import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { extraerMensajeError } from "../lib/errorHandler";

export interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
}

interface MedicoAPI {
  id: number;
  nombre: string;
  ap_paterno: string;
  ap_materno: string | null;
  especialidad: {
    nombre: string;
  } | null;
}

type RespuestaMedicos =
  | MedicoAPI[]
  | {
      data: MedicoAPI[];
      totalPages?: number;
    };

export function useMedicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const registros: MedicoAPI[] = [];
        let pagina = 1;
        let totalPaginas = 1;

        do {
          const respuesta = await api.get<RespuestaMedicos>("/medicos", {
            params: { page: pagina, limit: 100 },
            signal: controller.signal,
          });

          const contenido = respuesta.data;

          if (Array.isArray(contenido)) {
            registros.push(...contenido);
            totalPaginas = 1;
          } else {
            registros.push(...contenido.data);
            totalPaginas = contenido.totalPages ?? 1;
          }

          pagina += 1;
        } while (pagina <= totalPaginas);

        if (controller.signal.aborted) return;

        setMedicos(
          registros.map((medico) => ({
            id: String(medico.id),
            nombre: [medico.nombre, medico.ap_paterno, medico.ap_materno]
              .filter(Boolean)
              .join(" "),
            especialidad: medico.especialidad?.nombre ?? "Sin especialidad",
          })),
        );
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

  return { medicos, cargando, error };
}
