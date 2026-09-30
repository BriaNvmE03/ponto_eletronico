import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login";
import { AppDashboard } from "../pages/AppDashboard";
import { AdminDashboard } from "../pages/AdminDashboard";
import { SuperAdminDashboard } from "../pages/SuperAdminDashboard";
import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Livre para qualquer um) */}
        <Route path="/login" element={<Login />} />

        {/* =========================================
            ROTAS PRIVADAS (Requerem o Token JWT) 
            ========================================= */}
            
        {/* Nível 1: Disponível para qualquer usuário logado */}
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<AppDashboard />} />
        </Route>

        {/* Nível 2: Apenas para Gestores (ADMIN) e SuperAdministradores */}
        <Route element={<PrivateRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Nível 3: Restrito apenas para os SuperAdministradores do Sistema */}
        <Route element={<PrivateRoute allowedRoles={["SUPERADMIN"]} />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
        </Route>

        {/* ========================================= */}

        {/* Rota Coringa: Se digitar qualquer URL que não existe, joga pro Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
