import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { PaginaDashboard } from "./pages/PaginaDashboard";
import { PaginaLogin } from "./pages/PaginaLogin";
import { ErrorBoundary } from "./shared/components/ui/ErrorBoundary";
import { AlertaBanner } from "./shared/components/ui/AlertaBanner";
import { Spinner } from "./shared/components/ui/Spinner";
import { useAuth } from "./features/auth/hooks/useAuth";

const PaginaPacientes = lazy(() =>
  import("./pages/PaginaPacientes").then((modulo) => ({
    default: modulo.PaginaPacientes,
  })),
);

const PaginaDetallePaciente = lazy(() =>
  import("./pages/PaginaDetallePaciente").then((modulo) => ({
    default: modulo.PaginaDetallePaciente,
  })),
);

const PaginaNuevaCita = lazy(() =>
  import("./pages/PaginaNuevaCita").then((modulo) => ({
    default: modulo.PaginaNuevaCita,
  })),
);

const PaginaNotFound = lazy(() =>
  import("./pages/PaginaNotFound").then((modulo) => ({
    default: modulo.PaginaNotFound,
  })),
);

const PaginaCitas = lazy(() =>
  import("./pages/PaginaCitas").then((modulo) => ({
    default: modulo.PaginaCitas,
  })),
);

const PaginaReportes = lazy(() =>
  import("./pages/PaginaReportes").then((modulo) => ({
    default: modulo.PaginaReportes,
  })),
);

const PaginaSinAcceso = lazy(() =>
  import("./pages/PaginaSinAcceso").then((modulo) => ({
    default: modulo.PaginaSinAcceso,
  })),
);

const PaginaPerfil = lazy(() =>
  import("./pages/PaginaPerfil").then((modulo) => ({
    default: modulo.PaginaPerfil,
  })),
);

const PaginaHistorialCitas = lazy(() =>
  import("./pages/PaginaHistorialCitas").then((modulo) => ({
    default: modulo.PaginaHistorialCitas,
  })),
);

interface RutaProtegidaProps {
  rolesPermitidos?: string[];
}

function RutaProtegida({ rolesPermitidos }: RutaProtegidaProps) {
  const { token, isAuthenticated, usuario } = useAuth();

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && (!usuario || !rolesPermitidos.includes(usuario.rol))) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
}

function RutaLogin() {
  const { token, isAuthenticated } = useAuth();

  if (token && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <PaginaLogin />;
}

interface SeccionProtegidaProps {
  nombre: string;
  children: ReactNode;
}

function SeccionProtegida({ nombre, children }: SeccionProtegidaProps) {
  const location = useLocation();

  return (
    <ErrorBoundary
      key={`${location.pathname}${location.search}`}
      fallback={
        <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 lg:p-8">
          <AlertaBanner
            tipo="error"
            titulo={`No se pudo mostrar ${nombre}`}
            mensaje="Ocurrió un error inesperado. Puedes navegar a otra sección o recargar la página para intentarlo nuevamente."
            accion={{
              label: "Recargar página",
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Suspense fallback={<Spinner fullscreen mensaje="Cargando página..." />}>
      <Routes>
        <Route
          path="/login"
          element={
            <SeccionProtegida nombre="el inicio de sesión">
              <RutaLogin />
            </SeccionProtegida>
          }
        />

        <Route element={<RutaProtegida />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <SeccionProtegida nombre="el dashboard">
                  <PaginaDashboard />
                </SeccionProtegida>
              }
            />

            <Route
              path="/pacientes"
              element={
                <SeccionProtegida nombre="la lista de pacientes">
                  <PaginaPacientes />
                </SeccionProtegida>
              }
            />

            <Route
              path="/pacientes/:id"
              element={
                <SeccionProtegida nombre="el detalle del paciente">
                  <PaginaDetallePaciente />
                </SeccionProtegida>
              }
            />

            <Route
              path="/perfil"
              element={
                <SeccionProtegida nombre="el perfil">
                  <PaginaPerfil />
                </SeccionProtegida>
              }
            />

            <Route
              path="/citas"
              element={
                <SeccionProtegida nombre="las citas">
                  <PaginaCitas />
                </SeccionProtegida>
              }
            />

            <Route
              path="/citas/nueva"
              element={
                <SeccionProtegida nombre="el formulario de cita">
                  <PaginaNuevaCita />
                </SeccionProtegida>
              }
            />

            <Route
              path="/historial"
              element={
                <SeccionProtegida nombre="el historial de citas">
                  <PaginaHistorialCitas />
                </SeccionProtegida>
              }
            />

            <Route
              path="/sin-acceso"
              element={
                <SeccionProtegida nombre="la página de acceso restringido">
                  <PaginaSinAcceso />
                </SeccionProtegida>
              }
            />

            <Route element={<RutaProtegida rolesPermitidos={["GERENCIA"]} />}>
              <Route
                path="/reportes"
                element={
                  <SeccionProtegida nombre="los reportes">
                    <PaginaReportes />
                  </SeccionProtegida>
                }
              />
            </Route>

            <Route
              path="*"
              element={
                <SeccionProtegida nombre="la página solicitada">
                  <PaginaNotFound />
                </SeccionProtegida>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
