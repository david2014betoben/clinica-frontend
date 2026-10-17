import { NavLink, Outlet, useLocation } from "react-router-dom";

type IconoNombre = "dashboard" | "pacientes" | "cita";

function Icono({ nombre }: { nombre: IconoNombre }) {
  const props = {
    className: "size-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  if (nombre === "dashboard") {
    return (
      <svg {...props}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (nombre === "pacientes") {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3.25" />
        <path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" />
        <path d="M16 5.2a3.25 3.25 0 0 1 0 6.3M17 13.2a4.7 4.7 0 0 1 3.5 4.6V19" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M12 12.5v5M9.5 15h5" />
    </svg>
  );
}

const enlaces: Array<{
  to: string;
  texto: string;
  icono: IconoNombre;
}> = [
  { to: "/", texto: "Dashboard", icono: "dashboard" },
  { to: "/pacientes", texto: "Pacientes", icono: "pacientes" },
  { to: "/citas/nueva", texto: "Nueva cita", icono: "cita" },
];

function obtenerTituloRuta(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/pacientes") return "Pacientes";
  if (pathname.startsWith("/pacientes/")) return "Detalle del paciente";
  if (pathname === "/citas/nueva") return "Nueva cita";

  return "Página no encontrada";
}

export function Layout() {
  const { pathname } = useLocation();
  const tituloRuta = obtenerTituloRuta(pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <aside className="z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <svg
              aria-hidden="true"
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M3 12h4l2.2-5 4.2 10 2.1-5H21"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="font-bold tracking-tight text-slate-950 dark:text-white">
              MediPulse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestión Clínica
            </p>
          </div>
        </div>

        <div className="px-4 pb-3 lg:px-3">
          <NavLink
            to="/citas/nueva"
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <Icono nombre="cita" />
            Nueva cita
          </NavLink>
        </div>

        <div className="px-4 pb-2 pt-3 lg:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Menú principal
          </p>
        </div>

        <nav
          aria-label="Navegación principal"
          className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:gap-1.5 lg:px-3"
        >
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.to === "/"}
              className={({ isActive }) =>
                [
                  "inline-flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")
              }
            >
              <Icono nombre={enlace.icono} />
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-slate-200 px-5 py-4 dark:border-slate-800 lg:block">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Gestión clínica
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Pacientes y citas en un solo lugar.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
