# Lojinha do Grupo de Oração

App para substituir o caderno de anotações, controlando o que cada pessoa
pegou na lojinha e os fechamentos mensais/de eventos.

## Estrutura

- `backend/` — API em Node.js + Express + Prisma + PostgreSQL
- `frontend/` — (ainda vamos montar)

## Como rodar o backend na sua máquina

### 1. Pré-requisitos

- Node.js instalado (recomendo a versão 20 LTS)
- PostgreSQL instalado e rodando localmente (ou uma URL de conexão de um
  banco na nuvem, como o Neon ou o próprio banco da Vercel)

### 2. Instalar as dependências

```bash
cd backend
npm install
```

### 3. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Depois, abra o arquivo `.env` e ajuste a `DATABASE_URL` com os dados reais
do seu banco PostgreSQL (usuário, senha, host, porta e nome do banco).

### 4. Criar o banco de dados (rodar as migrations)

```bash
npm run prisma:migrate
```

Isso vai criar automaticamente todas as tabelas (Pessoa, Produto,
Lancamento, Fechamento, Pagamento, etc.) no seu banco PostgreSQL, com base
no `prisma/schema.prisma`.

### 5. Rodar o servidor

```bash
npm run dev
```

Se tudo der certo, você verá no terminal:

```
Servidor rodando em http://localhost:3333
```

### 6. Testar se está tudo funcionando

Abra no navegador (ou no Postman/Insomnia):

```
http://localhost:3333/health
```

Se aparecer `{"status":"ok","database":"conectado"}`, está tudo certo.

---

## Próximos passos

- [ ] Rotas de Pessoa (cadastrar, buscar por nome)
- [ ] Rotas de Produto (cadastrar, listar)
- [ ] Rotas de Lançamento (registrar compra, com validação de lote quando
      o produto tiver quantidade limitada)
- [ ] Rotas de Fechamento (abrir, fechar e gerar os Pagamentos)
- [ ] Frontend em React
