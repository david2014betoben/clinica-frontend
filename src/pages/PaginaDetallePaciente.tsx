import { useNavigate, useParams } from "react-router-dom";
import { pacientesIniciales } from "../data/pacientes";
import { PaginaNotFound } from "./PaginaNotFound";

export function PaginaDetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const paciente = pacientesIniciales.find((paciente) => paciente.id === id);

  if (!paciente) {
    return <PaginaNotFound />;
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 rounded-lg px-3 py-2 text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-bold dark:text-white">
        {paciente.nombre} {paciente.apellido}
      </h1>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            ID
          </dt>
          <dd>{paciente.id}</dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            Correo electrónico
          </dt>
          <dd>{paciente.email}</dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            Teléfono
          </dt>
          <dd>{paciente.telefono}</dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            Especialidad asignada
          </dt>
          <dd>{paciente.especialidadAsignada}</dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            Última cita
          </dt>
          <dd>{paciente.ultimaCita}</dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">
            Estado
          </dt>
          <dd className="capitalize">{paciente.estado.replace("_", " ")}</dd>
        </div>
      </dl>
    </section>
  );
}
