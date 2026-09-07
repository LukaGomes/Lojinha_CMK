import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function criarProduto(req: Request, res: Response) {
  const { nome, preco, controlaQuantidade } = req.body;

  if (!nome || preco === undefined) {
    return res
      .status(400)
      .json({ erro: "Os campos 'nome' e 'preco' são obrigatórios." });
  }

  const produto = await prisma.produto.create({
    data: {
      nome,
      preco,
      controlaQuantidade: Boolean(controlaQuantidade),
    },
  });

  return res.status(201).json(produto);
}

// Por padrão só retorna produtos ativos (usado na tela de lançamento).
// Passe ?todos=true pra ver também os desativados (útil numa tela de gestão de produtos).
export async function listarProdutos(req: Request, res: Response) {
  const { todos } = req.query;

  const produtos = await prisma.produto.findMany({
    where: todos === "true" ? undefined : { ativo: true },
    orderBy: { nome: "asc" },
  });

  return res.json(produtos);
}

export async function buscarProdutoPorId(req: Request, res: Response) {
  const { id } = req.params;

  const produto = await prisma.produto.findUnique({ where: { id } });

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  return res.json(produto);
}

// Edita nome e/ou preço. Não mexe em lançamentos antigos — eles já
// guardam o valor "congelado" no momento da compra, então mudar o preço
// aqui só afeta as próximas vendas.
export async function editarProduto(req: Request, res: Response) {
  const { id } = req.params;
  const { nome, preco } = req.body;

  const produtoExistente = await prisma.produto.findUnique({ where: { id } });

  if (!produtoExistente) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  if (nome === undefined && preco === undefined) {
    return res.status(400).json({
      erro: "Informe pelo menos 'nome' ou 'preco' pra atualizar.",
    });
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      nome: nome ?? undefined,
      preco: preco ?? undefined,
    },
  });

  return res.json(produto);
}

// Não apaga o produto de verdade (isso quebraria o histórico de lançamentos
// antigos que apontam pra ele) — só marca como inativo.
export async function desativarProduto(req: Request, res: Response) {
  const { id } = req.params;

  const produto = await prisma.produto.update({
    where: { id },
    data: { ativo: false },
  });

  return res.json(produto);
}

export async function reativarProduto(req: Request, res: Response) {
  const { id } = req.params;

  const produto = await prisma.produto.update({
    where: { id },
    data: { ativo: true },
  });

  return res.json(produto);
}
