import { useState } from "react";
import type { Metrica } from "../types";
import { MetricCard } from "../componentes/MetricCard";
import { StatusBadge } from "../componentes/StatusBadge";

export function PaginaDashboard() {
  const [pacientes, setPacientes] = useState(128);
  const [mantenimiento, setMantenimiento] = useState(false);

  const incrementarPacientes = () => {
    setPacientes((prev) => prev + 1);
  };

  const disminuirPacientes = () => {
    setPacientes((prev) => Math.max(0, prev - 1));
  };

  const metricas: Metrica[] = [
    {
      id: "pacientes",
      titulo: "Pacientes",
      valor: pacientes,
      descripcion: "Pacientes registrados",
      tendencia: "positiva",
      icono: "👥",
    },
    {
      id: "citas",
      titulo: "Citas Hoy",
      valor: 24,
      descripcion: "Citas programadas para hoy",
      tendencia: "neutra",
      icono: "📅",
    },
    {
      id: "consultas",
      titulo: "Consultas Pendientes",
      valor: 7,
      descripcion: "Consultas por atender",
      tendencia: "negativa",
      icono: "⏳",
    },
    {
      id: "disponibilidad",
      titulo: "Disponibilidad",
      valor: "92%",
      descripcion: "Disponibilidad de atención",
      tendencia: "positiva",
      icono: "✅",
    },
  ];

  return (
    <main
      className="min-h-screen p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.78)), url('/fondo-dashboard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {mantenimiento && (
        <div className="mb-6 rounded-lg bg-rose-100 p-4 text-rose-700">
          El sistema está en modo mantenimiento.
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-300">Resumen general del sistema</p>
        </div>

        <StatusBadge activo={!mantenimiento} />
      </header>

      <button
        type="button"
        onClick={() => setMantenimiento((prev) => !prev)}
        className="mb-6 rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
      >
        {mantenimiento ? "Desactivar mantenimiento" : "Activar mantenimiento"}
      </button>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((metrica) => (
          <div key={metrica.id}>
            <MetricCard metrica={metrica} />

            {metrica.id === "pacientes" && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={disminuirPacientes}
                  className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300"
                  aria-label="Disminuir pacientes"
                >
                  −
                </button>

                <button
                  type="button"
                  onClick={incrementarPacientes}
                  className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300"
                  aria-label="Aumentar pacientes"
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
