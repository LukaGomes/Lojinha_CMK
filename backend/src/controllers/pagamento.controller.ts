import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Lista os pagamentos de um fechamento (só existe depois que o fechamento
// foi fechado — é nesse momento que os Pagamento são gerados).
export async function listarPagamentosPorFechamento(req: Request, res: Response) {
  const { fechamentoId } = req.params;

  const pagamentos = await prisma.pagamento.findMany({
    where: { fechamentoId },
    include: { pessoa: true },
    orderBy: { pessoa: { nome: "asc" } },
  });

  return res.json(pagamentos);
}

export async function marcarPagamentoComoPago(req: Request, res: Response) {
  const { id } = req.params;

  const pagamento = await prisma.pagamento.findUnique({ where: { id } });

  if (!pagamento) {
    return res.status(404).json({ erro: "Pagamento não encontrado." });
  }

  const atualizado = await prisma.pagamento.update({
    where: { id },
    data: { pago: true, dataPagamento: new Date() },
  });

  return res.json(atualizado);
}

// Caso alguém marque como pago sem querer, dá pra desfazer.
export async function desmarcarPagamentoComoPago(req: Request, res: Response) {
  const { id } = req.params;

  const pagamento = await prisma.pagamento.findUnique({ where: { id } });

  if (!pagamento) {
    return res.status(404).json({ erro: "Pagamento não encontrado." });
  }

  const atualizado = await prisma.pagamento.update({
    where: { id },
    data: { pago: false, dataPagamento: null },
  });

  return res.json(atualizado);
}
