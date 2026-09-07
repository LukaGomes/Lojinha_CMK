import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getOrCreateFechamentoMensalAberto } from "../services/fechamento.service";

// Usado pelo responsável pela produção pra avisar: "hoje temos 20 copos
// de açaí disponíveis". Só faz sentido pra produtos com controlaQuantidade = true.
export async function criarLote(req: Request, res: Response) {
  const { produtoId, quantidadeDisponivel, fechamentoId } = req.body;

  if (!produtoId || quantidadeDisponivel === undefined) {
    return res.status(400).json({
      erro: "Os campos 'produtoId' e 'quantidadeDisponivel' são obrigatórios.",
    });
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  if (!produto.controlaQuantidade) {
    return res.status(400).json({
      erro: `O produto "${produto.nome}" não é um produto de quantidade limitada.`,
    });
  }

  // Se não vier um fechamentoId explícito (ex: pra um evento), usa o
  // fechamento mensal aberto por padrão.
  const fechamento = fechamentoId
    ? await prisma.fechamento.findUnique({ where: { id: fechamentoId } })
    : await getOrCreateFechamentoMensalAberto();

  if (!fechamento) {
    return res.status(404).json({ erro: "Fechamento não encontrado." });
  }

  const lote = await prisma.loteProducao.create({
    data: {
      produtoId,
      quantidadeDisponivel,
      fechamentoId: fechamento.id,
    },
  });

  return res.status(201).json(lote);
}

// Lista os lotes do dia (ou de um fechamento específico), já mostrando
// quanto já foi vendido de cada um — útil pra tela de lançamento saber
// se ainda tem açaí disponível.
export async function listarLotes(req: Request, res: Response) {
  const { fechamentoId } = req.query;

  const lotes = await prisma.loteProducao.findMany({
    where: fechamentoId ? { fechamentoId: String(fechamentoId) } : undefined,
    include: {
      produto: true,
      lancamentos: { select: { quantidade: true } },
    },
    orderBy: { data: "desc" },
  });

  const lotesComSaldo = lotes.map((lote) => {
    const vendido = lote.lancamentos.reduce((soma, l) => soma + l.quantidade, 0);
    return {
      id: lote.id,
      produto: lote.produto.nome,
      quantidadeDisponivel: lote.quantidadeDisponivel,
      quantidadeVendida: vendido,
      quantidadeRestante: lote.quantidadeDisponivel - vendido,
      data: lote.data,
    };
  });

  return res.json(lotesComSaldo);
}
