import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export default function RotaProtegida({ children }: { children: ReactNode }) {
  const { logado } = useAuth();
  const location = useLocation();

  if (!logado) {
    // Manda pro login, guardando de onde a pessoa veio, pra poder
    // voltar direto pra lá depois de entrar.
    return <Navigate to="/login" state={{ destino: location.pathname }} replace />;
  }

  return <>{children}</>;
}
