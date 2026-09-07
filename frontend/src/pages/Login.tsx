import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se a pessoa tentou acessar uma página protegida sem estar logada,
  // depois do login ela volta pra lá em vez de cair sempre no mesmo lugar.
  const destino = (location.state as { destino?: string })?.destino || "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);

    try {
      await entrar(email, senha);
      navigate(destino, { replace: true });
    } catch {
      setErro("Email ou senha incorretos.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full animate-reveal">
        <div className="flex justify-center mb-8">
          <Logo tamanho="lg" comTexto={false} />
        </div>
        <h1 className="text-2xl font-display font-semibold mb-1 text-center">Área do admin</h1>
        <p className="text-creme/60 mb-8 text-center">
          Entre pra consultar os lançamentos e fechamentos
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {erro && <p className="text-erro text-sm">{erro}</p>}

          <button type="submit" disabled={entrando} className="btn-primary w-full">
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
