import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

// Envolve as telas públicas de lançamento com um cabeçalho com a marca
// do grupo e acesso discreto à área do admin.
export default function LayoutPublico() {
  const { logado } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="animate-reveal flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo tamanho="sm" />
        <Link
          to={logado ? "/admin" : "/login"}
          className="text-xs font-medium text-dourado hover:text-dourado-escuro border border-dourado/30 hover:border-dourado rounded-full px-3 py-1.5 transition-colors"
        >
          Área do admin
        </Link>
      </header>
      <Outlet />
    </div>
  );
}
