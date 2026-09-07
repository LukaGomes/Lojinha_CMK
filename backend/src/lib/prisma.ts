import { PrismaClient } from "@prisma/client";

// Reaproveita a mesma instância do PrismaClient em toda a aplicação,
// evitando abrir várias conexões desnecessárias com o banco.
export const prisma = new PrismaClient();
