import { Router } from "express";
import {
  criarFechamentoEvento,
  listarFechamentos,
  buscarFechamentoMensalAberto,
  relatorioFechamento,
  fecharFechamento,
} from "../controllers/fechamento.controller";
import { exigirLogin } from "../middlewares/exigirLogin";

const router = Router();

// mensal-aberto continua público — é usado pelo fluxo de lançamento sem login.
router.get("/fechamentos/mensal-aberto", buscarFechamentoMensalAberto);

// O resto é gestão/consulta, exige login.
router.post("/fechamentos/evento", exigirLogin, criarFechamentoEvento);
router.get("/fechamentos", exigirLogin, listarFechamentos);
router.get("/fechamentos/:id/relatorio", exigirLogin, relatorioFechamento);
router.patch("/fechamentos/:id/fechar", exigirLogin, fecharFechamento);

export default router;
