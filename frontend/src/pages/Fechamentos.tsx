import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarFechamentos, Fechamento } from "../api/client";

export default function Fechamentos() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarFechamentos()
      .then(setFechamentos)
      .catch(() => setErro("Não foi possível carregar os fechamentos."))
      .finally(() => setCarregando(false));
  }, []);

  function formatarData(dataIso: string) {
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-2">
      <Link to="/admin" className="btn-ghost text-sm mb-2 inline-flex">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-display font-semibold mb-6">Fechamentos</h1>

      {erro && <p className="text-erro text-sm mb-4">{erro}</p>}

      {carregando ? (
        <p className="text-creme/40 text-sm">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {fechamentos.map((fechamento) => (
            <li key={fechamento.id}>
              <Link
                to={`/admin/fechamentos/${fechamento.id}`}
                className="card block p-4 hover:bg-dourado-claro/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium font-display">{fechamento.titulo}</span>
                  <span className={fechamento.status === "ABERTO" ? "badge-aberto" : "badge-fechado"}>
                    {fechamento.status === "ABERTO" ? "Aberto" : "Fechado"}
                  </span>
                </div>
                <span className="text-creme/40 text-xs">
                  desde {formatarData(fechamento.dataInicio)}
                </span>
              </Link>
            </li>
          ))}
          {fechamentos.length === 0 && (
            <p className="text-creme/40 text-sm">Nenhum fechamento ainda.</p>
          )}
        </ul>
      )}
    </div>
  );
}
