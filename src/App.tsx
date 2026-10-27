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

import { useAuthStore } from "./stores/authStore";

function RutaProtegida() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
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

          <Route path="/citas" element={<PaginaCitas />} />
          <Route path="/citas/nueva" element={<PaginaNuevaCita />} />
          <Route path="/reportes" element={<PaginaReportes />} />
          <Route path="*" element={<PaginaNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
