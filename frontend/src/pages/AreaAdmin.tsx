import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function AreaAdmin() {
  const { admin, sair } = useAuth();

  return (
    <div className="max-w-md mx-auto p-4 pt-8 animate-reveal">
      <div className="flex items-center justify-between mb-8">
        <Logo tamanho="sm" comTexto={false} />
        <button onClick={sair} className="btn-ghost text-sm">
          Sair
        </button>
      </div>

      <h1 className="text-2xl font-display font-semibold mb-6">Olá, {admin?.nome}!</h1>

      <div className="space-y-3">
        <Link to="/admin/produtos" className="card block p-4 hover:bg-dourado-claro/30 transition-colors">
          <span className="font-medium block">📦 Produtos</span>
          <span className="text-creme/50 text-sm">Cadastrar e gerenciar os produtos da lojinha</span>
        </Link>

        <Link to="/admin/fechamentos" className="card block p-4 hover:bg-dourado-claro/30 transition-colors">
          <span className="font-medium block">📊 Consulta e fechamento</span>
          <span className="text-creme/50 text-sm">Ver quanto cada um gastou e fechar o período</span>
        </Link>
      </div>
    </div>
  );
}
