import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo-inseguro-so-para-dev";

// O token expira em 7 dias — depois disso a pessoa precisa logar de novo.
const EXPIRACAO = "7d";

export interface TokenPayload {
  adminId: string;
  email: string;
}

export function gerarToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRACAO });
}

export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
