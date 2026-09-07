import { Router } from "express";
import { criarLancamento, listarLancamentos } from "../controllers/lancamento.controller";

const router = Router();

router.post("/lancamentos", criarLancamento);
router.get("/lancamentos", listarLancamentos);

export default router;
