import { Router } from "express";
import {
  criarPessoa,
  listarPessoas,
  buscarPessoaPorId,
} from "../controllers/pessoa.controller";

const router = Router();

router.post("/pessoas", criarPessoa);
router.get("/pessoas", listarPessoas);
router.get("/pessoas/:id", buscarPessoaPorId);

export default router;
