import { prisma } from "../lib/prisma";

// Formata o título padrão do fechamento mensal, ex: "Setembro/2026"
function tituloMesAtual(): string {
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const agora = new Date();
  return `${nomesMeses[agora.getMonth()]}/${agora.getFullYear()}`;
}

// Garante que sempre exista um Fechamento do tipo MENSAL com status ABERTO.
// Se já existir um aberto, retorna ele. Se não existir (ex: primeiro
// lançamento do sistema, ou o mês anterior acabou de ser fechado),
// cria um novo automaticamente.
//
// Quem está lançando uma compra no dia a dia nunca precisa se preocupar
// com isso — essa função resolve tudo por trás dos panos.
export async function getOrCreateFechamentoMensalAberto() {
  const fechamentoAberto = await prisma.fechamento.findFirst({
    where: { tipo: "MENSAL", status: "ABERTO" },
  });

  if (fechamentoAberto) {
    return fechamentoAberto;
  }

  return prisma.fechamento.create({
    data: {
      tipo: "MENSAL",
      titulo: tituloMesAtual(),
      status: "ABERTO",
    },
  });
}

// Formata uma data como "AAAA-MM-DD" (só o dia, sem hora) — usado como
// chave pra agrupar os lançamentos por dia.
function chaveDoDia(data: Date): string {
  return data.toISOString().split("T")[0];
}

// Monta o relatório detalhado de um Fechamento: pra cada pessoa, separa os
// itens por DIA em que foram pegos, e dentro de cada dia agrupa por produto
// (ex: 2 águas no mesmo dia viram uma linha só, mas água de dias diferentes
// fica em seções separadas). É essa lista que sua mãe vai usar pra cobrar
// cada pessoa, já mostrando o "extrato" dia a dia.
export async function montarRelatorioPorPessoa(fechamentoId: string) {
  const lancamentos = await prisma.lancamento.findMany({
    where: { fechamentoId },
    include: { pessoa: true, produto: true },
    orderBy: [{ pessoa: { nome: "asc" } }, { criadoEm: "asc" }],
  });

  const porPessoa = new Map<
    string,
    {
      pessoaId: string;
      nome: string;
      telefone: string | null;
      diasPorChave: Map<
        string,
        {
          data: string;
          itensPorChave: Map<
            string,
            { descricao: string; quantidade: number; valorTotal: number }
          >;
          subtotal: number;
        }
      >;
      valorTotal: number;
    }
  >();

  for (const lancamento of lancamentos) {
    const descricao = lancamento.produto
      ? lancamento.produto.nome
      : lancamento.descricaoAvulso ?? "Item avulso";

    // Agrupa por produto (produtoId) ou, pra itens avulsos, pela própria
    // descrição digitada — dentro do mesmo dia.
    const chaveItem = lancamento.produtoId ?? `avulso:${descricao}`;
    const dia = chaveDoDia(lancamento.criadoEm);
    const valor = Number(lancamento.valor);

    if (!porPessoa.has(lancamento.pessoaId)) {
      porPessoa.set(lancamento.pessoaId, {
        pessoaId: lancamento.pessoaId,
        nome: lancamento.pessoa.nome,
        telefone: lancamento.pessoa.telefone,
        diasPorChave: new Map(),
        valorTotal: 0,
      });
    }

    const registroPessoa = porPessoa.get(lancamento.pessoaId)!;

    if (!registroPessoa.diasPorChave.has(dia)) {
      registroPessoa.diasPorChave.set(dia, {
        data: dia,
        itensPorChave: new Map(),
        subtotal: 0,
      });
    }

    const registroDia = registroPessoa.diasPorChave.get(dia)!;

    const itemExistente = registroDia.itensPorChave.get(chaveItem);
    if (itemExistente) {
      itemExistente.quantidade += lancamento.quantidade;
      itemExistente.valorTotal += valor;
    } else {
      registroDia.itensPorChave.set(chaveItem, {
        descricao,
        quantidade: lancamento.quantidade,
        valorTotal: valor,
      });
    }

    registroDia.subtotal += valor;
    registroPessoa.valorTotal += valor;
  }

  return Array.from(porPessoa.values()).map((pessoa) => ({
    pessoaId: pessoa.pessoaId,
    nome: pessoa.nome,
    telefone: pessoa.telefone,
    valorTotal: pessoa.valorTotal,
    dias: Array.from(pessoa.diasPorChave.values())
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((dia) => ({
        data: dia.data,
        subtotal: dia.subtotal,
        itens: Array.from(dia.itensPorChave.values()).map((item) => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorTotal / item.quantidade,
          valorTotal: item.valorTotal,
        })),
      })),
  }));
}
