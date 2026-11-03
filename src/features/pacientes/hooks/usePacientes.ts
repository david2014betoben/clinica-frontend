import { useEffect } from "react";

import { usePacientesStore } from "../../../stores/pacientesStore";
import { useFiltrosStore } from "../../../stores/filtrosStore";
import { useDebounce } from "../../../hooks/useDebounce";

interface OpcionesUsePacientes {
  cargaInicial?: boolean;
}

export function usePacientes({
  cargaInicial = true,
}: OpcionesUsePacientes = {}) {
  const pacientes = usePacientesStore((state) => state.pacientes);
  const cargando = usePacientesStore((state) => state.cargando);
  const error = usePacientesStore((state) => state.error);
  const total = usePacientesStore((state) => state.total);
  const pagina = usePacientesStore((state) => state.pagina);
  const totalPaginas = usePacientesStore((state) => state.totalPaginas);

  const cargar = usePacientesStore((state) => state.cargar);
  const crear = usePacientesStore((state) => state.crear);
  const actualizar = usePacientesStore((state) => state.actualizar);
  const eliminar = usePacientesStore((state) => state.eliminar);

  const busqueda = useFiltrosStore((state) => state.queryPacientes);
  const setBusqueda = useFiltrosStore((state) => state.setQueryPacientes);
  const resetFiltros = useFiltrosStore((state) => state.resetFiltros);

  const busquedaDebounced = useDebounce(busqueda, 350);
  const esperandoDebounce = busqueda !== busquedaDebounced;
  const buscando = cargando || esperandoDebounce;

  useEffect(() => {
    if (!cargaInicial) return;

    void cargar(busquedaDebounced, 1);
  }, [cargaInicial, cargar, busquedaDebounced]);

  return {
    pacientes,
    cargando,
    error,
    total,
    pagina,
    totalPaginas,

    busqueda,
    busquedaDebounced,
    buscando,
    setBusqueda,
    resetFiltros,

    cargar,
    crear,
    actualizar,
    eliminar,
  };
}
