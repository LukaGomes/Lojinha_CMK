// Script pra criar (ou atualizar a senha d)o admin único do sistema.
// Roda assim, no terminal, dentro da pasta backend:
//
//   npm run criar-admin -- "seu@email.com" "sua-senha-aqui" "Seu Nome"
//
// (repare nos dois traços "--" antes dos argumentos — isso é necessário
// pro npm passar os argumentos pro script, em vez de tentar interpretar
// eles como opções do próprio npm)

import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const [email, senha, nome] = process.argv.slice(2);

  if (!email || !senha || !nome) {
    console.error(
      'Uso: npm run criar-admin -- "seu@email.com" "sua-senha" "Seu Nome"'
    );
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { senhaHash, nome },
    create: { email, senhaHash, nome },
  });

  console.log(`✅ Admin pronto: ${admin.nome} <${admin.email}>`);
  process.exit(0);
}

main().catch((erro) => {
  console.error("Erro ao criar admin:", erro);
  process.exit(1);
});
