import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  const estiloEnlace = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-200 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="bg-slate-950 p-4 text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
        <h1 className="mb-6 px-4 text-xl font-bold">Clínica</h1>

        <nav className="flex flex-col gap-2">
          <NavLink to="/" end className={estiloEnlace}>
            🏠 Dashboard
          </NavLink>

          <NavLink to="/pacientes" end className={estiloEnlace}>
            👥 Pacientes
          </NavLink>

          <NavLink to="/citas/nueva" className={estiloEnlace}>
            📅 Nueva cita
          </NavLink>
        </nav>
      </aside>

      <main className="min-h-screen p-4 dark:text-slate-100 md:ml-64 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
