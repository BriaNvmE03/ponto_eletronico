import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  // 1. Busca os dados de autenticação na máquina do usuário
  const token = localStorage.getItem("@ponto:token");
  const userStr = localStorage.getItem("@ponto:user");

  // 2. Se não estiver logado (sem token), chuta para a tela de Login
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // 3. Controle de Acesso Baseado em Cargos (RBAC - Role Based Access Control)
  // Se a rota definir regras (ex: só SUPERADMIN), e o usuário não tiver, mandamos ele pra tela base dele
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  // 4. Tudo certo! Ele tem token e tem permissão.
  // O componente <Outlet /> diz para o React: "Pode renderizar a tela que ele pediu!"
  return <Outlet />;
}
