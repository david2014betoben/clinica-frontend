import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { Layout } from "./layouts/Layout";
import { PaginaDashboard } from "./pages/PaginaDashboard";
import { PaginaPacientes } from "./pages/PaginaPacientes";
import { PaginaDetallePaciente } from "./pages/PaginaDetallePaciente";
import { PaginaNuevaCita } from "./pages/PaginaNuevaCita";
import { PaginaNotFound } from "./pages/PaginaNotFound";
import { PaginaCitas } from "./pages/PaginaCitas";
import { PaginaReportes } from "./pages/PaginaReportes";
import { PaginaLogin } from "./pages/PaginaLogin";
import { PaginaSinAcceso } from "./pages/PaginaSinAcceso";
import { PaginaPerfil } from "./pages/PaginaPerfil";
import { PaginaHistorialCitas } from "./pages/PaginaHistorialCitas";

import { ErrorBoundary } from "./shared/components/ui/ErrorBoundary";
import { AlertaBanner } from "./shared/components/ui/AlertaBanner";

import { useAuthStore } from "./stores/authStore";

interface RutaProtegidaProps {
  rolesPermitidos?: string[];
}

function RutaProtegida({ rolesPermitidos }: RutaProtegidaProps) {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const usuario = useAuthStore((state) => state.usuario);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && (!usuario || !rolesPermitidos.includes(usuario.rol))) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
}

function RutaLogin() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

          <Route path="/sin-acceso" element={<PaginaSinAcceso />} />

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

          <Route path="*" element={<PaginaNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
