import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";
import pessoaRoutes from "./routes/pessoa.routes";
import produtoRoutes from "./routes/produto.routes";
import fechamentoRoutes from "./routes/fechamento.routes";
import loteRoutes from "./routes/lote.routes";
import lancamentoRoutes from "./routes/lancamento.routes";
import authRoutes from "./routes/auth.routes";
import pagamentoRoutes from "./routes/pagamento.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(pessoaRoutes);
app.use(produtoRoutes);
app.use(fechamentoRoutes);
app.use(loteRoutes);
app.use(lancamentoRoutes);
app.use(authRoutes);
app.use(pagamentoRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
