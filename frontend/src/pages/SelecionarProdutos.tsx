import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarProdutos, Produto } from "../api/client";
import { useCarrinho } from "../context/CarrinhoContext";

export default function SelecionarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState("");

  // campos do item avulso (doação)
  const [mostrarAvulso, setMostrarAvulso] = useState(false);
  const [descricaoAvulso, setDescricaoAvulso] = useState("");
  const [valorAvulso, setValorAvulso] = useState("");

  const {
    pessoa,
    itens,
    adicionarItem,
    aumentarQuantidade,
    diminuirQuantidade,
    total,
  } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pessoa) {
      navigate("/lancamento/pessoa");
      return;
    }

    listarProdutos()
      .then(setProdutos)
      .catch(() => setErro("Não foi possível carregar os produtos."));
  }, [pessoa]);

  function adicionarProduto(produto: Produto) {
    setErro("");
    adicionarItem({
      produtoId: produto.id,
      quantidade: 1,
      nomeExibicao: produto.nome,
      precoUnitario: Number(produto.preco),
    });
  }

  function adicionarItemAvulso() {
    const valorNumerico = Number(valorAvulso.replace(",", "."));

    if (!descricaoAvulso.trim() || !valorNumerico || valorNumerico <= 0) {
      setErro("Preencha a descrição e um valor válido pro item avulso.");
      return;
    }

    setErro("");
    adicionarItem({
      descricaoAvulso: descricaoAvulso.trim(),
      valor: valorNumerico,
      quantidade: 1,
      nomeExibicao: descricaoAvulso.trim(),
      precoUnitario: valorNumerico,
    });

    setDescricaoAvulso("");
    setValorAvulso("");
    setMostrarAvulso(false);
  }

  // Índices, no array "itens" do carrinho, de cada tipo de item —
  // usado pra saber se um produto/avulso já está no carrinho e pra
  // acionar aumentar/diminuir na linha certa.
  const indexPorProdutoId = (produtoId: string) =>
    itens.findIndex((i) => i.produtoId === produtoId);

  const itensAvulsos = itens
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.produtoId);

  return (
    <div className="max-w-md mx-auto p-4 pt-2 pb-32">
      <h1 className="text-2xl font-display font-semibold mb-1">Lançar compra</h1>
      <p className="text-creme/60 mb-1">Passo 2 de 3 — o que {pessoa?.nome.split(" ")[0]} pegou?</p>
      {erro && <p className="text-erro text-sm mb-3">{erro}</p>}

      <div className="grid grid-cols-2 gap-3 mb-6">
        {produtos.map((produto) => {
          const index = indexPorProdutoId(produto.id);
          const noCarrinho = index !== -1;

          if (noCarrinho) {
            const item = itens[index];
            return (
              <div key={produto.id} className="bg-dourado-claro border border-dourado/30 rounded-xl p-3">
                <span className="font-medium block">{produto.nome}</span>
                <span className="text-creme/50 text-sm block mb-2">
                  R$ {Number(produto.preco).toFixed(2)}
                </span>
                <div className="flex items-center justify-between bg-carvao rounded-full px-1 py-1">
                  <button
                    onClick={() => diminuirQuantidade(index)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-dourado hover:bg-dourado-claro font-bold text-lg transition-colors active:scale-95"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="font-medium">{item.quantidade}</span>
                  <button
                    onClick={() => aumentarQuantidade(index)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-dourado hover:bg-dourado-claro font-bold text-lg transition-colors active:scale-95"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              key={produto.id}
              onClick={() => adicionarProduto(produto)}
              className="card-quieta p-3 text-left hover:border-dourado/40 hover:bg-dourado-claro/30 transition-colors"
            >
              <span className="font-medium block">{produto.nome}</span>
              <span className="text-creme/50 text-sm">R$ {Number(produto.preco).toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {/* Itens avulsos já adicionados, cada um com seu próprio stepper */}
      {itensAvulsos.length > 0 && (
        <ul className="space-y-2 mb-4">
          {itensAvulsos.map(({ item, index }) => (
            <li
              key={index}
              className="bg-dourado-claro border border-dourado/30 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <span className="font-medium block">{item.nomeExibicao}</span>
                <span className="text-creme/50 text-sm">
                  R$ {item.precoUnitario.toFixed(2)} cada
                </span>
              </div>
              <div className="flex items-center gap-2 bg-carvao rounded-full px-1 py-1">
                <button
                  onClick={() => diminuirQuantidade(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-dourado hover:bg-dourado-claro font-bold text-lg transition-colors active:scale-95"
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span className="font-medium w-4 text-center">{item.quantidade}</span>
                <button
                  onClick={() => aumentarQuantidade(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-dourado hover:bg-dourado-claro font-bold text-lg transition-colors active:scale-95"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!mostrarAvulso ? (
        <button
          onClick={() => setMostrarAvulso(true)}
          className="w-full py-3 rounded-xl border border-dashed border-neblina text-creme/60 hover:bg-carvao-elevado transition-colors mb-4"
        >
          + Item avulso (doação)
        </button>
      ) : (
        <div className="card-quieta p-3 space-y-2 mb-4">
          <input
            type="text"
            placeholder="Descrição (ex: Bolo doado)"
            className="input py-2"
            value={descricaoAvulso}
            onChange={(e) => setDescricaoAvulso(e.target.value)}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Valor (ex: 5,00)"
            className="input py-2"
            value={valorAvulso}
            onChange={(e) => setValorAvulso(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={adicionarItemAvulso} className="btn-primary flex-1 py-2">
              Adicionar
            </button>
            <button onClick={() => setMostrarAvulso(false)} className="btn-outline py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Barra fixa embaixo com o resumo do carrinho */}
      <div className="fixed bottom-0 left-0 right-0 bg-carvao/95 backdrop-blur border-t border-neblina/30 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <span className="text-sm text-creme/50 block">
              {itens.length} item(ns)
            </span>
            <span className="font-display font-semibold text-lg">R$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate("/lancamento/confirmar")}
            disabled={itens.length === 0}
            className="btn-primary px-6"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
