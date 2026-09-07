import { Request, Response, NextFunction } from "express";
import { verificarToken } from "../lib/auth";

// Adiciona a propriedade 'adminId' no req, pra rotas protegidas saberem
// quem está logado.
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

// Usa assim numa rota: router.get("/algo-protegido", exigirLogin, minhaFuncao)
export function exigirLogin(req: Request, res: Response, next: NextFunction) {
  const cabecalhoAuth = req.headers.authorization;

  if (!cabecalhoAuth || !cabecalhoAuth.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não enviado. Faça login novamente." });
  }

  const token = cabecalhoAuth.replace("Bearer ", "");

  try {
    const payload = verificarToken(token);
    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
}
