import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type IconoNombre = "dashboard" | "pacientes" | "cita" | "reportes";

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

  if (nombre === "reportes") {
    return (
      <svg {...props}>
        <path
          d="M4 19.5h16M6.5 16V10m5 6V4.5m5 11.5V8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
  { to: "/citas", texto: "Citas", icono: "cita" },
  { to: "/reportes", texto: "Reportes", icono: "reportes" },
];

export function Layout() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);

  const cerrarSesion = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
              end={enlace.to === "/" || enlace.to === "/citas"}
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

        <div className="mt-auto border-t border-slate-200 px-4 py-4 dark:border-slate-800 lg:px-3">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <svg
              aria-hidden="true"
              className="size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="flex min-h-16 items-center justify-end border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {usuario?.nombre ?? "Usuario"}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {usuario?.rol ?? "Sin rol"}
              </p>
            </div>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {(usuario?.nombre ?? "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
