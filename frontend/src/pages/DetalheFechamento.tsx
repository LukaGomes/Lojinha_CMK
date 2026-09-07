import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  buscarRelatorioFechamento,
  fecharFechamento,
  listarPagamentos,
  marcarComoPago,
  desmarcarComoPago,
  RelatorioFechamento,
  Pagamento,
} from "../api/client";

export default function DetalheFechamento() {
  const { id } = useParams<{ id: string }>();
  const [relatorio, setRelatorio] = useState<RelatorioFechamento | null>(null);
  const [pagamentosPorPessoa, setPagamentosPorPessoa] = useState<Map<string, Pagamento>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [fechando, setFechando] = useState(false);
  const [atualizandoPagamento, setAtualizandoPagamento] = useState<string | null>(null);

  // controla quais pessoas estão expandidas (mostrando os dias/itens)
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  async function carregar() {
    if (!id) return;
    setCarregando(true);
    setErro("");

    try {
      const dadosRelatorio = await buscarRelatorioFechamento(id);
      setRelatorio(dadosRelatorio);

      // pagamentos só existem depois que o fechamento foi fechado
      if (dadosRelatorio.fechamento.status === "FECHADO") {
        const pagamentos = await listarPagamentos(id);
        setPagamentosPorPessoa(new Map(pagamentos.map((p) => [p.pessoaId, p])));
      }
    } catch {
      setErro("Não foi possível carregar o relatório.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function alternarExpandida(pessoaId: string) {
    setExpandidas((atual) => {
      const nova = new Set(atual);
      if (nova.has(pessoaId)) {
        nova.delete(pessoaId);
      } else {
        nova.add(pessoaId);
      }
      return nova;
    });
  }

  async function handleFechar() {
    if (!id) return;

    if (
      !confirm(
        "Fechar esse período? Depois disso não é mais possível lançar nada nele, e a lista de pagamentos é gerada."
      )
    ) {
      return;
    }

    setFechando(true);
    setErro("");

    try {
      await fecharFechamento(id);
      await carregar(); // recarrega tudo, já trazendo os pagamentos gerados
    } catch (e: any) {
      setErro(e?.response?.data?.erro || "Não foi possível fechar o período.");
    } finally {
      setFechando(false);
    }
  }

  async function handleTogglePagamento(pagamento: Pagamento) {
    setAtualizandoPagamento(pagamento.id);
    setErro("");

    try {
      const atualizado = pagamento.pago
        ? await desmarcarComoPago(pagamento.id)
        : await marcarComoPago(pagamento.id);

      setPagamentosPorPessoa((atual) => {
        const novo = new Map(atual);
        novo.set(atualizado.pessoaId, atualizado);
        return novo;
      });
    } catch {
      setErro("Não foi possível atualizar o pagamento.");
    } finally {
      setAtualizandoPagamento(null);
    }
  }

  function formatarData(dataIso: string) {
    // dataIso vem como "AAAA-MM-DD" — evita usar new Date() direto aqui
    // pra não sofrer com fuso horário mudando o dia.
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  if (carregando) {
    return <p className="text-center text-creme/40 mt-16">Carregando...</p>;
  }

  if (!relatorio) {
    return <p className="text-center text-erro mt-16">{erro || "Fechamento não encontrado."}</p>;
  }

  const { fechamento, pessoas } = relatorio;
  const totalGeral = pessoas.reduce((soma, p) => soma + p.valorTotal, 0);
  const fechado = fechamento.status === "FECHADO";

  return (
    <div className="max-w-md mx-auto p-4 pt-2 pb-8">
      <Link to="/admin/fechamentos" className="btn-ghost text-sm mb-2 inline-flex">
        ← Voltar
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-semibold">{fechamento.titulo}</h1>
        <span className={fechamento.status === "ABERTO" ? "badge-aberto" : "badge-fechado"}>
          {fechamento.status === "ABERTO" ? "Aberto" : "Fechado"}
        </span>
      </div>
      <p className="text-creme/60 mb-6">
        Total do período: <span className="font-semibold">R$ {totalGeral.toFixed(2)}</span>
      </p>

      {erro && <p className="text-erro text-sm mb-4">{erro}</p>}

      <ul className="space-y-2 mb-6">
        {pessoas.map((pessoa) => {
          const expandida = expandidas.has(pessoa.pessoaId);
          const pagamento = pagamentosPorPessoa.get(pessoa.pessoaId);

          return (
            <li key={pessoa.pessoaId} className="card overflow-hidden">
              <div className="w-full flex items-center justify-between p-3">
                <button
                  onClick={() => alternarExpandida(pessoa.pessoaId)}
                  className="flex-1 text-left hover:opacity-70 transition-opacity"
                >
                  <span className="font-medium block">{pessoa.nome}</span>
                  {pessoa.telefone && (
                    <span className="text-creme/40 text-xs">{pessoa.telefone}</span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">R$ {pessoa.valorTotal.toFixed(2)}</span>

                  {fechado && pagamento && (
                    <button
                      onClick={() => handleTogglePagamento(pagamento)}
                      disabled={atualizandoPagamento === pagamento.id}
                      className={pagamento.pago ? "badge-pago hover:brightness-95" : "badge-pendente hover:brightness-95"}
                    >
                      {atualizandoPagamento === pagamento.id
                        ? "..."
                        : pagamento.pago
                        ? "✓ Pago"
                        : "Pendente"}
                    </button>
                  )}

                  <button
                    onClick={() => alternarExpandida(pessoa.pessoaId)}
                    className="text-creme/30 px-1"
                  >
                    {expandida ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {expandida && (
                <div className="border-t border-neblina/20 p-3 space-y-3 bg-carvao-elevado/50">
                  {pessoa.dias.map((dia) => (
                    <div key={dia.data}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-creme/70">
                          {formatarData(dia.data)}
                        </span>
                        <span className="text-sm text-creme/50">R$ {dia.subtotal.toFixed(2)}</span>
                      </div>
                      <ul className="space-y-1">
                        {dia.itens.map((item, i) => (
                          <li key={i} className="flex items-center justify-between text-sm pl-2">
                            <span className="text-creme/80">
                              {item.descricao} <span className="text-creme/40">x{item.quantidade}</span>
                            </span>
                            <span className="text-creme/60">R$ {item.valorTotal.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
        {pessoas.length === 0 && (
          <p className="text-creme/40 text-sm">Nenhum lançamento nesse período ainda.</p>
        )}
      </ul>

      {fechamento.status === "ABERTO" && (
        <button onClick={handleFechar} disabled={fechando} className="btn-danger w-full">
          {fechando ? "Fechando..." : "Fechar este período"}
        </button>
      )}
    </div>
  );
}
