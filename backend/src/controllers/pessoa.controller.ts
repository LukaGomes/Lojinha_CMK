import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function criarPessoa(req: Request, res: Response) {
  const { nome, telefone } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
  }

  const pessoa = await prisma.pessoa.create({
    data: { nome, telefone },
  });

  return res.status(201).json(pessoa);
}

// Lista pessoas, com busca opcional por nome (?nome=joao)
// Usado pela tela de lançamento pra buscar quem vai pegar algo na lojinha.
export async function listarPessoas(req: Request, res: Response) {
  const { nome } = req.query;

  const pessoas = await prisma.pessoa.findMany({
    where: nome
      ? { nome: { contains: String(nome), mode: "insensitive" } }
      : undefined,
    orderBy: { nome: "asc" },
  });

  return res.json(pessoas);
}

export async function buscarPessoaPorId(req: Request, res: Response) {
  const { id } = req.params;

  const pessoa = await prisma.pessoa.findUnique({ where: { id } });

  if (!pessoa) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }

  return res.json(pessoa);
}
