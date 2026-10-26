import { useEffect } from "react";
import { useMedicosStore } from "../stores/medicosStore";

export type { Medico } from "../stores/medicosStore";

export function useMedicos() {
  const medicos = useMedicosStore((state) => state.medicos);
  const cargando = useMedicosStore((state) => state.cargando);
  const error = useMedicosStore((state) => state.error);
  const cargar = useMedicosStore((state) => state.cargar);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return {
    medicos,
    cargando,
    error,
  };
}
