import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listarProdutos,
  criarProduto,
  editarProduto,
  desativarProduto,
  reativarProduto,
  Produto,
} from "../api/client";

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [salvando, setSalvando] = useState(false);

  // controla qual produto está em modo de edição no momento
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [precoEdicao, setPrecoEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  function carregarProdutos() {
    setCarregando(true);
    listarProdutos(true) // true = mostra também os desativados
      .then(setProdutos)
      .catch(() => setErro("Não foi possível carregar os produtos."))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    const precoNumerico = Number(preco.replace(",", "."));

    if (!nome.trim() || !precoNumerico || precoNumerico <= 0) {
      setErro("Preencha o nome e um preço válido.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await criarProduto(nome.trim(), precoNumerico);
      setNome("");
      setPreco("");
      carregarProdutos();
    } catch {
      setErro("Não foi possível cadastrar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(produto: Produto) {
    setEditandoId(produto.id);
    setNomeEdicao(produto.nome);
    setPrecoEdicao(String(produto.preco).replace(".", ","));
    setErro("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
  }

  async function salvarEdicao(produto: Produto) {
    const precoNumerico = Number(precoEdicao.replace(",", "."));

    if (!nomeEdicao.trim() || !precoNumerico || precoNumerico <= 0) {
      setErro("Preencha o nome e um preço válido.");
      return;
    }

    setSalvandoEdicao(true);
    setErro("");

    try {
      await editarProduto(produto.id, { nome: nomeEdicao.trim(), preco: precoNumerico });
      setEditandoId(null);
      carregarProdutos();
    } catch {
      setErro("Não foi possível salvar as alterações.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function handleDesativar(produto: Produto) {
    if (!confirm(`Desativar "${produto.nome}"? Ele some da tela de lançamento, mas o histórico continua.`)) {
      return;
    }

    try {
      await desativarProduto(produto.id);
      carregarProdutos();
    } catch {
      setErro("Não foi possível desativar o produto.");
    }
  }

  async function handleReativar(produto: Produto) {
    try {
      await reativarProduto(produto.id);
      carregarProdutos();
    } catch {
      setErro("Não foi possível reativar o produto.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-2">
      <Link to="/admin" className="btn-ghost text-sm mb-2 inline-flex">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-display font-semibold mb-6">Produtos</h1>

      <form onSubmit={handleCriar} className="card-quieta p-3 space-y-2 mb-6">
        <input
          type="text"
          placeholder="Nome do produto"
          className="input py-2"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="Preço (ex: 3,00)"
          className="input py-2"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
        <button type="submit" disabled={salvando} className="btn-primary w-full py-2">
          {salvando ? "Salvando..." : "+ Cadastrar produto"}
        </button>
      </form>

      {erro && <p className="text-erro text-sm mb-4">{erro}</p>}

      {carregando ? (
        <p className="text-creme/40 text-sm">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {produtos.map((produto) => {
            const emEdicao = editandoId === produto.id;

            if (emEdicao) {
              return (
                <li key={produto.id} className="border border-dourado/30 bg-dourado-claro rounded-xl p-3 space-y-2">
                  <input
                    type="text"
                    className="input py-2"
                    value={nomeEdicao}
                    onChange={(e) => setNomeEdicao(e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input py-2"
                    value={precoEdicao}
                    onChange={(e) => setPrecoEdicao(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarEdicao(produto)}
                      disabled={salvandoEdicao}
                      className="btn-primary flex-1 py-2"
                    >
                      {salvandoEdicao ? "Salvando..." : "Salvar"}
                    </button>
                    <button onClick={cancelarEdicao} className="btn-outline py-2">
                      Cancelar
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={produto.id}
                className={produto.ativo ? "card flex items-center justify-between p-3" : "card-quieta flex items-center justify-between p-3 opacity-50"}
              >
                <div>
                  <span className="font-medium block">{produto.nome}</span>
                  <span className="text-creme/50 text-sm">
                    R$ {Number(produto.preco).toFixed(2)}
                    {!produto.ativo && " — desativado"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => iniciarEdicao(produto)} className="btn-ghost text-sm">
                    Editar
                  </button>
                  {produto.ativo ? (
                    <button
                      onClick={() => handleDesativar(produto)}
                      className="text-sm text-erro hover:opacity-80 font-medium"
                    >
                      Desativar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReativar(produto)}
                      className="text-sm text-dourado hover:brightness-90 font-medium"
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {produtos.length === 0 && (
            <p className="text-creme/40 text-sm">Nenhum produto cadastrado ainda.</p>
          )}
        </ul>
      )}
    </div>
  );
}
