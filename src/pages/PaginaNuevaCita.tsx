import { useNavigate } from "react-router-dom";
import { FormularioCita } from "../componentes/FormularioCita";

export function PaginaNuevaCita() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        ← Cancelar
      </button>

      <FormularioCita />
    </div>
  );
}
