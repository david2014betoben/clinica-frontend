import { Navigate, Outlet, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<RutaLogin />} />

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PaginaDashboard />} />

          <Route path="/pacientes" element={<PaginaPacientes />} />

          <Route path="/pacientes/:id" element={<PaginaDetallePaciente />} />

          <Route path="/perfil" element={<PaginaPerfil />} />

          <Route path="/citas" element={<PaginaCitas />} />

          <Route path="/citas/nueva" element={<PaginaNuevaCita />} />

          <Route path="/sin-acceso" element={<PaginaSinAcceso />} />

          <Route element={<RutaProtegida rolesPermitidos={["GERENCIA"]} />}>
            <Route path="/reportes" element={<PaginaReportes />} />
          </Route>

          <Route path="*" element={<PaginaNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
