import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Rota simples só pra confirmar que a API e a conexão com o banco estão OK.
router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "conectado" });
  } catch (error) {
    res.status(500).json({ status: "erro", database: "desconectado" });
  }
});

export default router;
