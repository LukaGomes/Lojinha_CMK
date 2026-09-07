import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  getOrCreateFechamentoMensalAberto,
  montarRelatorioPorPessoa,
} from "../services/fechamento.service";

// Usado pra abrir um Fechamento de EVENTO (ex: "Retiro de Outubro").
// O mensal não precisa ser criado por aqui — ele é automático (ver service).
export async function criarFechamentoEvento(req: Request, res: Response) {
  const { titulo } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: "O campo 'titulo' é obrigatório." });
  }

  const fechamento = await prisma.fechamento.create({
    data: { tipo: "EVENTO", titulo, status: "ABERTO" },
  });

  return res.status(201).json(fechamento);
}

export async function listarFechamentos(req: Request, res: Response) {
  const fechamentos = await prisma.fechamento.findMany({
    orderBy: { dataInicio: "desc" },
  });

  return res.json(fechamentos);
}

// Endpoint de conveniência pro frontend: retorna (ou já cria) o
// fechamento mensal atualmente aberto, pra saber em qual lançar por padrão.
export async function buscarFechamentoMensalAberto(_req: Request, res: Response) {
  const fechamento = await getOrCreateFechamentoMensalAberto();
  return res.json(fechamento);
}

// Consulta o relatório detalhado a qualquer momento (mesmo com o
// fechamento ainda ABERTO) — útil pra conferir antes de fechar de vez.
export async function relatorioFechamento(req: Request, res: Response) {
  const { id } = req.params;

  const fechamento = await prisma.fechamento.findUnique({ where: { id } });

  if (!fechamento) {
    return res.status(404).json({ erro: "Fechamento não encontrado." });
  }

  const relatorio = await montarRelatorioPorPessoa(id);

  return res.json({ fechamento, pessoas: relatorio });
}

// O coração do fechamento: soma os Lancamento de cada Pessoa nesse
// Fechamento e gera um Pagamento por pessoa — essa é a lista que sua mãe
// vai usar pra cobrar. Depois disso, o Fechamento vira FECHADO e nenhum
// lançamento novo pode mais ser feito nele (ver controller de Lançamento).
export async function fecharFechamento(req: Request, res: Response) {
  const { id } = req.params;

  const fechamento = await prisma.fechamento.findUnique({ where: { id } });

  if (!fechamento) {
    return res.status(404).json({ erro: "Fechamento não encontrado." });
  }

  if (fechamento.status === "FECHADO") {
    return res.status(400).json({ erro: "Esse fechamento já está fechado." });
  }

  // Monta a lista detalhada (itens + total por pessoa)
  const relatorio = await montarRelatorioPorPessoa(id);

  // Gera um Pagamento por pessoa com o total apurado
  await prisma.$transaction([
    ...relatorio.map((pessoa) =>
      prisma.pagamento.create({
        data: {
          pessoaId: pessoa.pessoaId,
          fechamentoId: id,
          valorTotal: pessoa.valorTotal,
        },
      })
    ),
    prisma.fechamento.update({
      where: { id },
      data: { status: "FECHADO", dataFim: new Date() },
    }),
  ]);

  return res.json({
    fechamento: { ...fechamento, status: "FECHADO" },
    // Lista completa pra sua mãe usar: cada pessoa, o que ela pegou
    // (produto/item + quantidade + valor) e o total a cobrar.
    pessoas: relatorio,
  });
}
