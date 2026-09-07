import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { criarLancamento } from "../api/client";
import { useCarrinho } from "../context/CarrinhoContext";

export default function ConfirmarCarrinho() {
  const { pessoa, itens, removerItem, aumentarQuantidade, diminuirQuantidade, limparCarrinho, total } = useCarrinho();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pessoa || itens.length === 0) {
      navigate("/lancamento/pessoa");
    }
  }, [pessoa, itens]);

  async function confirmarLancamento() {
    if (!pessoa) return;

    setEnviando(true);
    setErro("");

    try {
      await criarLancamento(
        pessoa.id,
        itens.map((item) => ({
          produtoId: item.produtoId,
          descricaoAvulso: item.descricaoAvulso,
          valor: item.valor,
          quantidade: item.quantidade,
          loteId: item.loteId,
        }))
      );
      setSucesso(true);
    } catch (e: any) {
      setErro(e?.response?.data?.erro || "Não foi possível registrar o lançamento.");
    } finally {
      setEnviando(false);
    }
  }

  function lancarParaOutraPessoa() {
    limparCarrinho();
    navigate("/lancamento/pessoa");
  }

  if (sucesso) {
    return (
      <div className="max-w-md mx-auto p-4 text-center pt-16 animate-reveal">
        <div className="w-16 h-16 rounded-full bg-sucesso/15 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-sucesso" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-semibold mb-2">Lançamento registrado!</h1>
        <p className="text-creme/60 mb-8">
          {pessoa?.nome} — R$ {total.toFixed(2)}
        </p>
        <button onClick={lancarParaOutraPessoa} className="btn-primary w-full">
          Lançar para outra pessoa
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-2 pb-32">
      <h1 className="text-2xl font-display font-semibold mb-1">Lançar compra</h1>
      <p className="text-creme/60 mb-6">Passo 3 de 3 — confirma pra {pessoa?.nome}?</p>

      <ul className="space-y-2 mb-6">
        {itens.map((item, index) => (
          <li key={index} className="card p-3 flex items-center justify-between">
            <div>
              <span className="font-medium block">{item.nomeExibicao}</span>
              <span className="text-creme/50 text-sm">
                R$ {item.precoUnitario.toFixed(2)} cada
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-carvao rounded-full px-1 py-1">
                <button
                  onClick={() => diminuirQuantidade(index)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-dourado hover:bg-carvao-elevado font-bold transition-colors active:scale-95"
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span className="w-5 text-center font-medium">{item.quantidade}</span>
                <button
                  onClick={() => aumentarQuantidade(index)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-dourado hover:bg-carvao-elevado font-bold transition-colors active:scale-95"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
              <span className="font-medium w-16 text-right">
                R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
              </span>
              <button onClick={() => removerItem(index)} className="btn-ghost text-sm">
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      {erro && <p className="text-erro text-sm mb-4">{erro}</p>}

      <div className="fixed bottom-0 left-0 right-0 bg-carvao/95 backdrop-blur border-t border-neblina/30 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-creme/60">Total</span>
            <span className="font-display font-semibold text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/lancamento/produtos")} className="btn-outline">
              Voltar
            </button>
            <button onClick={confirmarLancamento} disabled={enviando} className="btn-primary flex-1">
              {enviando ? "Lançando..." : "Confirmar lançamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
