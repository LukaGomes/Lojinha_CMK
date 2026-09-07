import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getOrCreateFechamentoMensalAberto } from "../services/fechamento.service";

interface ItemLancamento {
  produtoId?: string;
  descricaoAvulso?: string;
  valor?: number;
  quantidade?: number;
  loteId?: string;
}

// Cria vários lançamentos de uma vez, todos pra MESMA pessoa (ex: ela pegou
// água + pastel + açaí — isso é UM lançamento com 3 itens, não 3 chamadas
// separadas). Ou funciona também com um item só, se preferir.
export async function criarLancamento(req: Request, res: Response) {
  const { pessoaId, fechamentoId, itens } = req.body as {
    pessoaId?: string;
    fechamentoId?: string;
    itens?: ItemLancamento[];
  };

  if (!pessoaId) {
    return res.status(400).json({ erro: "O campo 'pessoaId' é obrigatório." });
  }

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: "O campo 'itens' é obrigatório e deve ser uma lista com pelo menos 1 item.",
    });
  }

  const pessoa = await prisma.pessoa.findUnique({ where: { id: pessoaId } });
  if (!pessoa) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }

  const fechamento = fechamentoId
    ? await prisma.fechamento.findUnique({ where: { id: fechamentoId } })
    : await getOrCreateFechamentoMensalAberto();

  if (!fechamento) {
    return res.status(404).json({ erro: "Fechamento não encontrado." });
  }

  if (fechamento.status === "FECHADO") {
    return res.status(400).json({
      erro: "Esse fechamento já está fechado, não é possível lançar mais nada nele.",
    });
  }

  // Controla quanto de cada lote já foi "reservado" pelos itens ANTERIORES
  // dessa mesma requisição — importante pra não deixar passar, por exemplo,
  // 2 lançamentos de açaí no mesmo pedido que juntos estourem o lote, mesmo
  // que cada um sozinho pareça válido.
  const reservadoNoLote = new Map<string, number>();

  const dadosParaCriar: {
    pessoaId: string;
    produtoId?: string;
    descricaoAvulso?: string;
    loteId?: string;
    valor: number;
    quantidade: number;
    fechamentoId: string;
  }[] = [];

  for (const [index, item] of itens.entries()) {
    const quantidade = item.quantidade ?? 1;
    const posicao = `Item ${index + 1}`;

    // ----------------------------------------------------
    // Caso 1: item avulso/doado ("outro") — sem produtoId
    // ----------------------------------------------------
    if (!item.produtoId) {
      if (!item.descricaoAvulso || item.valor === undefined) {
        return res.status(400).json({
          erro: `${posicao}: pra item avulso, 'descricaoAvulso' e 'valor' são obrigatórios.`,
        });
      }

      dadosParaCriar.push({
        pessoaId,
        descricaoAvulso: item.descricaoAvulso,
        valor: item.valor,
        quantidade,
        fechamentoId: fechamento.id,
      });
      continue;
    }

    // ----------------------------------------------------
    // Caso 2: produto do catálogo
    // ----------------------------------------------------
    const produto = await prisma.produto.findUnique({
      where: { id: item.produtoId },
    });

    if (!produto) {
      return res
        .status(404)
        .json({ erro: `${posicao}: produto não encontrado.` });
    }

    if (!produto.ativo) {
      return res.status(400).json({
        erro: `${posicao}: o produto "${produto.nome}" está desativado e não pode ser vendido.`,
      });
    }

    if (produto.controlaQuantidade) {
      if (!item.loteId) {
        return res.status(400).json({
          erro: `${posicao}: o produto "${produto.nome}" tem quantidade limitada — informe o 'loteId' do dia.`,
        });
      }

      const lote = await prisma.loteProducao.findUnique({
        where: { id: item.loteId },
      });

      if (!lote) {
        return res
          .status(404)
          .json({ erro: `${posicao}: lote de produção não encontrado.` });
      }

      if (lote.produtoId !== produto.id) {
        return res.status(400).json({
          erro: `${posicao}: esse lote não pertence ao produto "${produto.nome}".`,
        });
      }

      const totalJaVendido = await prisma.lancamento.aggregate({
        where: { loteId: item.loteId },
        _sum: { quantidade: true },
      });

      const vendidoAntes = totalJaVendido._sum.quantidade ?? 0;
      const jaReservadoNessaRequisicao = reservadoNoLote.get(item.loteId) ?? 0;
      const restante = lote.quantidadeDisponivel - vendidoAntes - jaReservadoNessaRequisicao;

      if (quantidade > restante) {
        return res.status(400).json({
          erro: `${posicao}: sem estoque suficiente de "${produto.nome}". Restam apenas ${restante} unidade(s) nesse lote.`,
        });
      }

      reservadoNoLote.set(item.loteId, jaReservadoNessaRequisicao + quantidade);
    }

    dadosParaCriar.push({
      pessoaId,
      produtoId: produto.id,
      // valor "congelado" a partir do preço atual do produto — não recalcula
      // depois se o preço mudar, pra não bagunçar o histórico.
      valor: Number(produto.preco) * quantidade,
      quantidade,
      loteId: produto.controlaQuantidade ? item.loteId : undefined,
      fechamentoId: fechamento.id,
    });
  }

  // Cria todos os lançamentos numa transação: ou tudo entra, ou nada entra
  // (evita, por exemplo, criar 2 dos 3 itens e o 3º dar erro no meio do caminho).
  const lancamentosCriados = await prisma.$transaction(
    dadosParaCriar.map((dados) => prisma.lancamento.create({ data: dados }))
  );

  return res.status(201).json(lancamentosCriados);
}

export async function listarLancamentos(req: Request, res: Response) {
  const { fechamentoId, pessoaId } = req.query;

  const lancamentos = await prisma.lancamento.findMany({
    where: {
      fechamentoId: fechamentoId ? String(fechamentoId) : undefined,
      pessoaId: pessoaId ? String(pessoaId) : undefined,
    },
    include: { pessoa: true, produto: true },
    orderBy: { criadoEm: "desc" },
  });

  return res.json(lancamentos);
}
