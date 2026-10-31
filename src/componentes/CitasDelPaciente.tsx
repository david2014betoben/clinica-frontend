import { useNavigate } from "react-router-dom";

import { useApi } from "../hooks/useApi";
import type { Cita } from "../services/citas";

import { AlertaBanner } from "../shared/components/ui/AlertaBanner";
import { EstadoVacio } from "../shared/components/ui/EstadoVacio";

interface RespuestaCitas {
  data: Cita[];
  total: number;
}

interface Props {
  pacienteId: number;
}

export function CitasDelPaciente({ pacienteId }: Props) {
  const navigate = useNavigate();

  const { data, cargando, error, recargar } = useApi<RespuestaCitas>("/citas");

  const citas =
    data?.data.filter((cita) => cita.id_paciente === pacienteId) ?? [];

  return (
    <section
      aria-labelledby="citas-paciente-titulo"
      aria-busy={cargando}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <h2
        id="citas-paciente-titulo"
        className="font-semibold text-slate-950 dark:text-white"
      >
        Citas del paciente
      </h2>

      <div className="mt-3">
        {cargando ? (
          <div role="status">
            <span className="sr-only">Cargando citas del paciente...</span>

            <div aria-hidden="true" className="flex h-5 items-center">
              <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ) : error ? (
          <AlertaBanner
            tipo="error"
            titulo="No se pudieron cargar las citas"
            mensaje={error}
            accion={{
              label: "Reintentar",
              onClick: recargar,
            }}
          />
        ) : citas.length === 0 ? (
          <EstadoVacio
            titulo="Este paciente no tiene citas"
            descripcion="Todavía no hay citas registradas para este paciente."
            accion={{
              label: "Nueva cita",
              onClick: () => navigate("/citas/nueva"),
            }}
          />
        ) : (
          <p
            aria-live="polite"
            className="text-sm text-slate-600 dark:text-slate-300"
          >
            {citas.length} cita(s) registrada(s)
          </p>
        )}
      </div>
    </section>
  );
}
