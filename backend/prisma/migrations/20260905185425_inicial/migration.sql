-- CreateEnum
CREATE TYPE "TipoFechamento" AS ENUM ('MENSAL', 'EVENTO');

-- CreateEnum
CREATE TYPE "StatusFechamento" AS ENUM ('ABERTO', 'FECHADO');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "controlaQuantidade" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteProducao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidadeDisponivel" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechamentoId" TEXT NOT NULL,

    CONSTRAINT "LoteProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fechamento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoFechamento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "status" "StatusFechamento" NOT NULL DEFAULT 'ABERTO',

    CONSTRAINT "Fechamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "produtoId" TEXT,
    "descricaoAvulso" TEXT,
    "loteId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "fechamentoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "fechamentoId" TEXT NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Pessoa_nome_idx" ON "Pessoa"("nome");

-- CreateIndex
CREATE INDEX "Lancamento_pessoaId_idx" ON "Lancamento"("pessoaId");

-- CreateIndex
CREATE INDEX "Lancamento_fechamentoId_idx" ON "Lancamento"("fechamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_pessoaId_fechamentoId_key" ON "Pagamento"("pessoaId", "fechamentoId");

-- AddForeignKey
ALTER TABLE "LoteProducao" ADD CONSTRAINT "LoteProducao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProducao" ADD CONSTRAINT "LoteProducao_fechamentoId_fkey" FOREIGN KEY ("fechamentoId") REFERENCES "Fechamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteProducao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_fechamentoId_fkey" FOREIGN KEY ("fechamentoId") REFERENCES "Fechamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_fechamentoId_fkey" FOREIGN KEY ("fechamentoId") REFERENCES "Fechamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
