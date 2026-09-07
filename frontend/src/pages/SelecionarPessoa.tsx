import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buscarPessoas, criarPessoa, Pessoa } from "../api/client";
import { useCarrinho } from "../context/CarrinhoContext";

export default function SelecionarPessoa() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [erro, setErro] = useState("");

  const { setPessoa } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCarregando(true);
      buscarPessoas(busca)
        .then(setResultados)
        .catch(() => setErro("Não foi possível buscar as pessoas."))
        .finally(() => setCarregando(false));
    }, 300); // pequeno delay pra não buscar a cada tecla digitada

    return () => clearTimeout(timeout);
  }, [busca]);

  function escolherPessoa(pessoa: Pessoa) {
    setPessoa(pessoa);
    navigate("/lancamento/produtos");
  }

  async function cadastrarNovaPessoa() {
    if (!novoNome.trim()) {
      setErro("Digite o nome da pessoa.");
      return;
    }

    try {
      const pessoa = await criarPessoa(novoNome.trim(), novoTelefone.trim() || undefined);
      escolherPessoa(pessoa);
    } catch {
      setErro("Não foi possível cadastrar a pessoa.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-2">
      <h1 className="text-2xl font-display font-semibold mb-1">Lançar compra</h1>
      <p className="text-creme/60 mb-6">Passo 1 de 3 — quem está pegando?</p>

      {!mostrarCadastro ? (
        <>
          <input
            autoFocus
            type="text"
            placeholder="Buscar pelo nome..."
            className="input mb-4"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {carregando && <p className="text-creme/40 text-sm">Buscando...</p>}
          {erro && <p className="text-erro text-sm mb-2">{erro}</p>}

          <ul className="space-y-2 mb-6">
            {resultados.map((pessoa) => (
              <li key={pessoa.id}>
                <button
                  onClick={() => escolherPessoa(pessoa)}
                  className="w-full text-left px-4 py-3 card-quieta hover:border-dourado/40 hover:bg-dourado-claro/40 transition-colors"
                >
                  <span className="font-medium">{pessoa.nome}</span>
                  {pessoa.telefone && (
                    <span className="text-creme/40 text-sm block">{pessoa.telefone}</span>
                  )}
                </button>
              </li>
            ))}
            {!carregando && resultados.length === 0 && busca && (
              <p className="text-creme/40 text-sm">Nenhuma pessoa encontrada com esse nome.</p>
            )}
          </ul>

          <button
            onClick={() => setMostrarCadastro(true)}
            className="w-full py-3 rounded-xl border border-dashed border-neblina text-creme/60 hover:bg-carvao-elevado transition-colors"
          >
            + Cadastrar nova pessoa
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Nome"
            className="input"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <input
            type="text"
            placeholder="Telefone (opcional)"
            className="input"
            value={novoTelefone}
            onChange={(e) => setNovoTelefone(e.target.value)}
          />
          {erro && <p className="text-erro text-sm">{erro}</p>}
          <div className="flex gap-2">
            <button onClick={cadastrarNovaPessoa} className="btn-primary flex-1">
              Cadastrar e continuar
            </button>
            <button onClick={() => setMostrarCadastro(false)} className="btn-outline">
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
