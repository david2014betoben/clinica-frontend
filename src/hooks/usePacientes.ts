import { useEffect } from "react";
import { usePacientesStore } from "../stores/pacientesStore";

export function usePacientes() {
  const pacientes = usePacientesStore((state) => state.opcionesPacientes);
  const cargando = usePacientesStore((state) => state.cargandoOpciones);
  const error = usePacientesStore((state) => state.errorOpciones);
  const cargarOpciones = usePacientesStore((state) => state.cargarOpciones);

  useEffect(() => {
    void cargarOpciones();
  }, [cargarOpciones]);

  return {
    pacientes,
    cargando,
    error,
    recargar: cargarOpciones,
  };
}
