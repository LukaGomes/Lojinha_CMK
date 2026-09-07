import { Router } from "express";
import {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  editarProduto,
  desativarProduto,
  reativarProduto,
} from "../controllers/produto.controller";
import { exigirLogin } from "../middlewares/exigirLogin";

const router = Router();

// Listar continua aberto — a tela de lançamento (sem login) também usa isso.
router.get("/produtos", listarProdutos);
router.get("/produtos/:id", buscarProdutoPorId);

// Criar/editar/desativar/reativar produto exige login (ação de gestão, só do admin).
router.post("/produtos", exigirLogin, criarProduto);
router.patch("/produtos/:id", exigirLogin, editarProduto);
router.patch("/produtos/:id/desativar", exigirLogin, desativarProduto);
router.patch("/produtos/:id/reativar", exigirLogin, reativarProduto);

export default router;
