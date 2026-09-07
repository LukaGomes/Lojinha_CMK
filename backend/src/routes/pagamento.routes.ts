import { Router } from "express";
import {
  listarPagamentosPorFechamento,
  marcarPagamentoComoPago,
  desmarcarPagamentoComoPago,
} from "../controllers/pagamento.controller";
import { exigirLogin } from "../middlewares/exigirLogin";

const router = Router();

router.get("/fechamentos/:fechamentoId/pagamentos", exigirLogin, listarPagamentosPorFechamento);
router.patch("/pagamentos/:id/pagar", exigirLogin, marcarPagamentoComoPago);
router.patch("/pagamentos/:id/desfazer-pagamento", exigirLogin, desmarcarPagamentoComoPago);

export default router;
