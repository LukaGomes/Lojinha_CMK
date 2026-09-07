import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { gerarToken } from "../lib/auth";

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Os campos 'email' e 'senha' são obrigatórios." });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  // Mensagem genérica de propósito — não dizemos se foi o email ou a senha
  // que errou, pra não dar dica pra quem estiver tentando adivinhar.
  const erroCredenciais = { erro: "Email ou senha incorretos." };

  if (!admin) {
    return res.status(401).json(erroCredenciais);
  }

  const senhaValida = await bcrypt.compare(senha, admin.senhaHash);

  if (!senhaValida) {
    return res.status(401).json(erroCredenciais);
  }

  const token = gerarToken({ adminId: admin.id, email: admin.email });

  return res.json({
    token,
    admin: { id: admin.id, nome: admin.nome, email: admin.email },
  });
}
