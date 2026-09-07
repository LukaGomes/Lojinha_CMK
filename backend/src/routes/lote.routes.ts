import { Router } from "express";
import { criarLote, listarLotes } from "../controllers/lote.controller";

const router = Router();

router.post("/lotes", criarLote);
router.get("/lotes", listarLotes);

export default router;
